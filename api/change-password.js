// api/change-password.js
// Permite que QUALQUER usuário logado troque a própria senha — exige
// confirmar a senha atual antes de aceitar a nova (diferente de
// /api/users.js, que é só pra admin trocar a senha de outra pessoa).
// Usa a chave SECRETA do Supabase, nunca exposta ao navegador.

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
    `${SB_URL}/rest/v1/sessions?token=eq.${encodeURIComponent(token)}&select=user_id,username,expires_at,tenant_id&limit=1`,
    { headers: secretHeaders() }
  );
  if (!r.ok) return null;
  const rows = await r.json();
  const session = rows && rows[0];
  if (!session) return null;
  if (new Date(session.expires_at) < new Date()) return null;
  return session;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!SB_URL || !SB_SECRET) return res.status(500).json({ error: 'Servidor não configurado' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const session = await validateSession(token);
  if (!session) return res.status(401).json({ error: 'Sessão inválida ou expirada, faça login novamente' });

  try {
    const { currentPasswordHash, newPasswordHash } = req.body || {};
    if (!currentPasswordHash || !newPasswordHash) {
      return res.status(400).json({ error: 'Informe a senha atual e a nova senha' });
    }

    const r = await fetch(
      `${SB_URL}/rest/v1/erp_users?id=eq.${encodeURIComponent(session.user_id)}&tenant_id=eq.${session.tenant_id}&select=password_hash&limit=1`,
      { headers: secretHeaders() }
    );
    const rows = await r.json();
    const user = rows && rows[0];
    if (!user || user.password_hash !== currentPasswordHash) {
      return res.status(401).json({ error: 'Senha atual incorreta' });
    }

    const u = await fetch(`${SB_URL}/rest/v1/erp_users?id=eq.${encodeURIComponent(session.user_id)}&tenant_id=eq.${session.tenant_id}`, {
      method: 'PATCH',
      headers: secretHeaders({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ password_hash: newPasswordHash }),
    });
    if (!u.ok) throw new Error(await u.text());

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro em /api/change-password:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}
