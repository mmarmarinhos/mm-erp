// api/storage.js
// Proxy de leitura/escrita do kv_store (onde ficam pedidos, clientes,
// financeiro, produtos etc). Só atende quem mandar um tíquete de acesso
// válido (emitido por /api/login). Usa a chave SECRETA do Supabase,
// que nunca é exposta ao navegador.

const SB_URL = process.env.SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;

function secretHeaders(extra = {}) {
  return {
    apikey: SB_SECRET,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function validateSession(token) {
  if (!token) return null;
  const r = await fetch(
    `${SB_URL}/rest/v1/sessions?token=eq.${encodeURIComponent(token)}&select=username,role,expires_at,tenant_id&limit=1`,
    { headers: secretHeaders() }
  );
  if (!r.ok) return null;
  const rows = await r.json();
  const session = rows && rows[0];
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  if (!session.tenant_id) return null; // sessão pré-multi-tenancy: força novo login
  return session;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!SB_URL || !SB_SECRET) return res.status(500).json({ error: 'Servidor não configurado (faltam variáveis de ambiente)' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const session = await validateSession(token);
  if (!session) return res.status(401).json({ error: 'Sessão inválida ou expirada, faça login novamente' });

  try {
    const { action, key, value, prefix } = req.body || {};

    if (action === 'get') {
      if (!key) return res.status(400).json({ error: 'Informe a chave' });
      const r = await fetch(`${SB_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}&tenant_id=eq.${session.tenant_id}&limit=1`, { headers: secretHeaders() });
      const rows = await r.json();
      if (!rows || !rows[0]) return res.status(200).json({ value: null });
      return res.status(200).json({ key, value: rows[0].value });
    }

    if (action === 'set') {
      if (!key) return res.status(400).json({ error: 'Informe a chave' });
      const r = await fetch(`${SB_URL}/rest/v1/kv_store`, {
        method: 'POST',
        headers: secretHeaders({ Prefer: 'resolution=merge-duplicates,return=minimal' }),
        body: JSON.stringify({ key, value, tenant_id: session.tenant_id, updated_at: new Date().toISOString() }),
      });
      if (!r.ok) throw new Error(await r.text());
      return res.status(200).json({ key, value });
    }

    if (action === 'delete') {
      if (!key) return res.status(400).json({ error: 'Informe a chave' });
      const r = await fetch(`${SB_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}&tenant_id=eq.${session.tenant_id}`, {
        method: 'DELETE',
        headers: secretHeaders(),
      });
      if (!r.ok) throw new Error(await r.text());
      return res.status(200).json({ key, deleted: true });
    }

    if (action === 'list') {
      const qs = (prefix ? `?key=like.${encodeURIComponent(prefix + '%')}&select=key` : '?select=key') + `&tenant_id=eq.${session.tenant_id}`;
      const r = await fetch(`${SB_URL}/rest/v1/kv_store${qs}`, { headers: secretHeaders() });
      const rows = await r.json();
      return res.status(200).json({ keys: (rows || []).map(row => row.key), prefix: prefix || '' });
    }

    return res.status(400).json({ error: 'Ação não reconhecida' });
  } catch (err) {
    console.error('Erro em /api/storage:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
