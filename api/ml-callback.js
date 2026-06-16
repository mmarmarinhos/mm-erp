// api/ml-callback.js
// Recebe o código OAuth do ML após autorização e troca pelo access_token + refresh_token

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

    // Salvar tokens no Supabase (tabela kv_store)
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    await fetch(`${supabaseUrl}/rest/v1/kv_store`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'resolution=merge-duplicates',
      },
      body: JSON.stringify({
        key: 'ml_tokens',
        value: JSON.stringify({
          access_token:  data.access_token,
          refresh_token: data.refresh_token,
          token_type:    data.token_type,
          expires_in:    data.expires_in,
          user_id:       data.user_id,
          obtained_at:   Date.now(),
        }),
      }),
    });

    // Redirecionar para o ERP com sucesso
    return res.redirect('/?ml_connected=true');

  } catch (err) {
    console.error('Erro no callback ML:', err);
    return res.redirect(`/?ml_error=${encodeURIComponent('Erro interno ao autenticar')}`);
  }
}
