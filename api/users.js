// api/users.js
// Proxy de gestão de usuários (listar, criar, ativar/desativar, trocar
// permissão, trocar senha de outro usuário). Só atende quem mandar um
// tíquete de acesso válido E que pertença a um administrador. Usa a
// chave SECRETA do Supabase, nunca exposta ao navegador.

const SB_URL = process.env.SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;

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

async function validateAdminSession(token) {
  if (!token) return null;
  const r = await fetch(
    `${SB_URL}/rest/v1/sessions?token=eq.${encodeURIComponent(token)}&select=username,role,expires_at&limit=1`,
    { headers: secretHeaders() }
  );
  if (!r.ok) return null;
  const rows = await r.json();
  const session = rows && rows[0];
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  if (session.role !== 'admin') return null;
  return session;
}

function genRecoveryKey() {
  const ch = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return [0, 1, 2, 3].map(() => [0, 1, 2, 3].map(() => ch[Math.floor(Math.random() * ch.length)]).join('')).join('-');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!SB_URL || !SB_SECRET) return res.status(500).json({ error: 'Servidor não configurado (faltam variáveis de ambiente)' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const session = await validateAdminSession(token);
  if (!session) return res.status(401).json({ error: 'Sessão inválida, expirada ou sem permissão de administrador' });

  try {
    const { action } = req.body || {};

    if (action === 'list') {
      const rows = await sbRpc('list_users_safe');
      return res.status(200).json({ users: rows || [] });
    }

    if (action === 'create') {
      const { username, displayName, passwordHash, role } = req.body;
      if (!username || !passwordHash) return res.status(400).json({ error: 'Informe usuário e senha' });
      const rkey = genRecoveryKey();
      const created = await sbRpc('create_erp_user', {
        p_username: username, p_display_name: displayName || username,
        p_password_hash: passwordHash, p_recovery_key: rkey, p_role: role || 'vendedor',
      });
      if (!created) return res.status(400).json({ error: 'Usuário já existe' });
      return res.status(200).json({ recoveryKey: rkey });
    }

    if (action === 'toggleActive') {
      const { id, active } = req.body;
      if (!id) return res.status(400).json({ error: 'Informe o id do usuário' });
      await sbRpc('set_user_active', { p_id: String(id), p_active: !!active });
      return res.status(200).json({ ok: true });
    }

    if (action === 'updateProfile') {
      const { id, displayName, role, customModules } = req.body;
      if (!id) return res.status(400).json({ error: 'Informe o id do usuário' });
      await sbRpc('update_user_profile', {
        p_id: String(id), p_display_name: displayName, p_role: role, p_custom_modules: customModules ?? null,
      });
      return res.status(200).json({ ok: true });
    }

    if (action === 'setPassword') {
      const { id, passwordHash } = req.body;
      if (!id || !passwordHash) return res.status(400).json({ error: 'Informe o id e a nova senha' });
      await sbRpc('set_user_password', { p_id: String(id), p_new_hash: passwordHash });
      return res.status(200).json({ ok: true });
    }

    return res.status(400).json({ error: 'Ação não reconhecida' });
  } catch (err) {
    console.error('Erro em /api/users:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
