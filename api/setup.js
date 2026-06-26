// api/setup.js
// Cria o primeiro usuário administrador do sistema. Só funciona se
// AINDA NÃO existir nenhum usuário (verificado no servidor, com a
// chave secreta) — depois que existe o primeiro, esse endpoint não
// cria mais ninguém, e a gestão de usuários passa a ser feita por
// /api/users.js, que exige login de admin.

import crypto from 'crypto';

const SB_URL = process.env.SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;
const SESSION_HOURS = 24;

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
  return r.json();
}

async function sbInsert(table, data) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: secretHeaders({ Prefer: 'return=minimal' }),
    body: JSON.stringify(data),
  });
  if (!r.ok) throw new Error(`[INSERT ${table}] ${r.status}: ${await r.text()}`);
}

function genRecoveryKey() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return [0, 1, 2, 3].map(() => [0, 1, 2, 3].map(() => ch[Math.floor(Math.random() * ch.length)]).join('')).join('-');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!SB_URL || !SB_SECRET) return res.status(500).json({ error: 'Servidor não configurado (faltam variáveis de ambiente)' });

  try {
    const countRaw = await sbRpc('count_erp_users');
    const count = typeof countRaw === 'number' ? countRaw : (Array.isArray(countRaw) ? (countRaw[0]?.count ?? countRaw[0] ?? 0) : (countRaw?.count ?? 0));
    if (count > 0) return res.status(403).json({ error: 'Já existe um administrador cadastrado' });

    const { username, displayName, passwordHash } = req.body || {};
    if (!username || !passwordHash) return res.status(400).json({ error: 'Informe usuário e senha' });

    const rkey = genRecoveryKey();
    const created = await sbRpc('create_erp_user', {
      p_username: String(username).trim().toLowerCase(),
      p_display_name: displayName || username,
      p_password_hash: passwordHash,
      p_recovery_key: rkey,
      p_role: 'admin',
    });
    if (!created) return res.status(400).json({ error: 'Não foi possível criar o usuário' });

    const rows = await sbRpc('verify_login', {
      p_username: String(username).trim().toLowerCase(),
      p_password_hash: passwordHash,
    });
    const safeUser = rows && rows[0];

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000).toISOString();
    await sbInsert('sessions', {
      token,
      user_id: safeUser.id,
      username: safeUser.username,
      display_name: safeUser.display_name,
      role: safeUser.role,
      expires_at: expiresAt,
    });

    return res.status(200).json({
      recoveryKey: rkey,
      token,
      user: { id: safeUser.id, username: safeUser.username, displayName: safeUser.display_name, role: safeUser.role },
    });
  } catch (err) {
    console.error('Erro em /api/setup:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
