// api/ml-callback.js
// Recebe o código OAuth do ML após autorização e troca pelo access_token + refresh_token
// Os tokens são salvos no Vercel Edge Config (não no banco de dados Supabase)
// Isso garante que zerar o banco de dados NÃO afeta a conexão com o Mercado Livre,
// e diferente de Environment Variables, o Edge Config não precisa de redeploy.

async function saveTokensToEdgeConfig(tokens) {
  const edgeConfigId = process.env.ML_EDGE_CONFIG_ID;
  const apiToken     = process.env.VERCEL_API_TOKEN;

  const res = await fetch(`https://api.vercel.com/v1/edge-config/${edgeConfigId}/items`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{ operation: 'upsert', key: 'ml_tokens', value: tokens }],
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Falha ao salvar tokens no Edge Config: ${errBody}`);
  }
}

export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error) {
    return res.redirect(`/?ml_error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    return res.status(400).json({ error: 'Código de autorização não encontrado' });
  }

  try {
    const response = await fetch('https://api.mercadolibre.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'authorization_code',
        client_id:     process.env.ML_CLIENT_ID,
        client_secret: process.env.ML_CLIENT_SECRET,
        code,
        redirect_uri:  process.env.ML_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro ao obter token ML:', data);
      return res.redirect(`/?ml_error=${encodeURIComponent(data.message || 'Erro ao autenticar')}`);
    }

    const tokens = {
      access_token:  data.access_token,
      refresh_token: data.refresh_token,
      token_type:    data.token_type,
      expires_in:    data.expires_in,
      user_id:       data.user_id,
      obtained_at:   Date.now(),
    };

    await saveTokensToEdgeConfig(tokens);

    return res.redirect('/?ml_connected=true');

  } catch (err) {
    console.error('Erro no callback ML:', err);
    return res.redirect(`/?ml_error=${encodeURIComponent('Erro interno ao autenticar')}`);
  }
}

