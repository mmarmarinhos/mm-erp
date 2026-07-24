// api/backup-cron.js
// Backup diário automático do banco do MM ERP. Disparado pelo Cron da Vercel
// (configurado em vercel.json), protegido por CRON_SECRET — só a própria
// Vercel (ou quem tiver o segredo) consegue chamar isso.
//
// Lê tenants + erp_users + kv_store do Supabase e grava um retrato do dia
// dentro do próprio repositório GitHub (pasta /backups). De propósito, o
// backup mora numa infraestrutura DIFERENTE da que ele protege — se o
// Supabase tiver um incidente, o backup não é afetado junto.

const SB_URL = process.env.SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
const GH_TOKEN = process.env.GITHUB_BACKUP_TOKEN;
const GH_REPO = process.env.GITHUB_BACKUP_REPO || 'mmarmarinhos/mm-erp';

function secretHeaders(extra = {}) {
  return {
    apikey: SB_SECRET,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function fetchAll(table) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}?select=*`, { headers: secretHeaders() });
  if (!r.ok) throw new Error(`[fetch ${table}] ${r.status}: ${await r.text()}`);
  return r.json();
}

export default async function handler(req, res) {
  // Só a Vercel (ou quem tiver o CRON_SECRET) pode disparar o backup.
  const auth = req.headers.authorization || '';
  if (!process.env.CRON_SECRET || auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  if (!SB_URL || !SB_SECRET) return res.status(500).json({ error: 'Servidor não configurado (variáveis do Supabase ausentes)' });
  if (!GH_TOKEN) return res.status(500).json({ error: 'Servidor não configurado (GITHUB_BACKUP_TOKEN ausente)' });

  try {
    const [tenants, erp_users, kv_store] = await Promise.all([
      fetchAll('tenants'),
      fetchAll('erp_users'),
      fetchAll('kv_store'),
    ]);

    const snapshot = {
      generated_at: new Date().toISOString(),
      counts: { tenants: tenants.length, erp_users: erp_users.length, kv_store: kv_store.length },
      tenants,
      erp_users,
      kv_store,
    };

    const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const path = `backups/${dateStr}.json`;
    const content = Buffer.from(JSON.stringify(snapshot, null, 2)).toString('base64');

    // Um arquivo por dia. Se por algum motivo o cron rodar 2x no mesmo dia,
    // busca o sha atual pra atualizar em vez de falhar tentando criar de novo.
    let sha;
    const existing = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${path}`, {
      headers: { Authorization: `token ${GH_TOKEN}` },
    });
    if (existing.ok) sha = (await existing.json()).sha;

    const put = await fetch(`https://api.github.com/repos/${GH_REPO}/contents/${path}`, {
      method: 'PUT',
      headers: { Authorization: `token ${GH_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: `backup automático ${dateStr}`,
        content,
        ...(sha ? { sha } : {}),
      }),
    });
    if (!put.ok) throw new Error(`[github put] ${put.status}: ${await put.text()}`);

    console.log(`Backup ${dateStr} OK —`, snapshot.counts);
    return res.status(200).json({ ok: true, path, counts: snapshot.counts });
  } catch (err) {
    console.error('Erro no backup-cron:', err);
    return res.status(500).json({ error: 'Erro ao gerar backup', detail: err.message });
  }
}
