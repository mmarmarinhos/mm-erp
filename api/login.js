// api/login.js
// Verifica usuário+senha usando a chave SECRETA do Supabase (nunca exposta
// ao navegador) e, se a senha bater, emite um "tíquete de acesso" (token
// aleatório) que o navegador usa nas próximas requisições, em vez de
// guardar usuário/senha.

import crypto from 'crypto';

const SB_URL = process.env.SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
const SESSION_HOURS = 24 * 30; // 30 dias — sessão persistente (o navegador guarda o tíquete em localStorage; a validade real é controlada aqui, no servidor)

function secretHeaders(extra = {}) {
  return {
    apikey: SB_SECRET,
    'Content-Type': 'application/json',
    ...extra,
  };
}

async function sbRpc(fn, args = {}) {
  const r = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: secretHeaders(),
    body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`[RPC ${fn}] ${r.status}: ${await r.text()}`);
  const text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function sbInsert(table, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: secretHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`[INSERT ${table}] ${r.status}: ${await r.text()}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!SB_URL || !SB_SECRET) return res.status(500).json({ error: 'Servidor não configurado (faltam variáveis de ambiente)' });

  try {
    const { username, passwordHash, empresa } = req.body || {};
    if (!username || !passwordHash) return res.status(400).json({ error: 'Informe usuário e senha' });

    // Etapa 3: o login identifica a EMPRESA pelo código (slug) e valida o
    // usuário dentro dela — empresas suspensas não entram. Clientes antigos
    // (sem o campo) caem no tenant zero, pra transição sem trancar ninguém.
    const slug = String(empresa || 'mmarmarinhos').trim().toLowerCase();
    const rows = await sbRpc('verify_login_slug', {
      p_slug: slug,
      p_username: String(username).trim().toLowerCase(),
      p_password_hash: passwordHash,
    });
    const safeUser = rows && rows[0];
    if (!safeUser) return res.status(401).json({ error: 'Empresa, usuário ou senha incorretos' });

    // Licença por usuários simultâneos: 0/NULL no tenant = sem limite. A
    // checagem conta PESSOAS ativas nos últimos 15 min, não sessões — a
    // mesma pessoa logando num 2º aparelho não consome vaga extra, e quem
    // fica 15 min sem usar libera a vaga sozinho, sem precisar deslogar.
    const hasSlot = await sbRpc('check_concurrent_slot', {
      p_tenant: safeUser.tenant_id,
      p_username: safeUser.username,
    });
    if (hasSlot === false) {
      return res.status(403).json({ error: 'Limite de usuários simultâneos atingido. Peça para alguém sair, ou aguarde uma vaga liberar.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString();

    await sbInsert('sessions', {
      token,
      user_id: safeUser.id,
      username: safeUser.username,
      display_name: safeUser.display_name,
      role: safeUser.role,
      tenant_id: safeUser.tenant_id,
      expires_at: expiresAt,
    });

    sbRpc('touch_last_login', { p_username: safeUser.username }).catch(() => {});

    return res.status(200).json({
      token,
      user: {
        id: safeUser.id,
        username: safeUser.username,
        displayName: safeUser.display_name,
        role: safeUser.role,
        customModules: safeUser.custom_modules ?? null,
        customPermissions: safeUser.custom_permissions ?? null,
        tenantModules: safeUser.enabled_modules ?? ["all"],
        tenantName: safeUser.tenant_name ?? null,
      },
    });
  } catch (err) {
    console.error('Erro em /api/login:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
