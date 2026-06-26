// api/logout.js
// Invalida o tíquete de acesso no servidor (apaga da tabela 'sessions'),
// pra que ele não possa mais ser usado mesmo que alguém tenha
// conseguido copiá-lo antes do fim natural da validade.

const SB_URL = process.env.SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;

function secretHeaders(extra = {}) {
  return {
    apikey: SB_SECRET,
    'Content-Type': 'application/json',
    ...extra,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!SB_URL || !SB_SECRET) return res.status(500).json({ error: 'Servidor não configurado' });

  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return res.status(200).json({ ok: true }); // nada pra invalidar

  try {
    await fetch(`${SB_URL}/rest/v1/sessions?token=eq.${encodeURIComponent(token)}`, {
      method: 'DELETE',
      headers: secretHeaders(),
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Erro em /api/logout:', err);
    return res.status(200).json({ ok: true }); // logout local segue mesmo se isso falhar
  }
}
