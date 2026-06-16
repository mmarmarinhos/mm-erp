// api/ml-orders.js
// Busca pedidos entregues do ML e retorna para o ERP
// Também gerencia renovação de tokens

async function getTokens(supabaseUrl, supabaseKey) {
  const res = await fetch(`${supabaseUrl}/rest/v1/kv_store?key=eq.ml_tokens&select=value`, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
    },
  });
  const data = await res.json();
  if (!data || data.length === 0) return null;
  return JSON.parse(data[0].value);
}

async function refreshToken(tokens, supabaseUrl, supabaseKey) {
  const res = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type:    'refresh_token',
      client_id:     process.env.ML_CLIENT_ID,
      client_secret: process.env.ML_CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
    }),
  });

  const newTokens = await res.json();
  if (!res.ok) throw new Error('Falha ao renovar token: ' + JSON.stringify(newTokens));

  const updated = {
    access_token:  newTokens.access_token,
    refresh_token: newTokens.refresh_token,
    token_type:    newTokens.token_type,
    expires_in:    newTokens.expires_in,
    user_id:       tokens.user_id,
    obtained_at:   Date.now(),
  };

  await fetch(`${supabaseUrl}/rest/v1/kv_store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Prefer': 'resolution=merge-duplicates',
    },
    body: JSON.stringify({ key: 'ml_tokens', value: JSON.stringify(updated) }),
  });

  return updated;
}

export default async function handler(req, res) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  try {
    // Buscar tokens salvos
    let tokens = await getTokens(supabaseUrl, supabaseKey);

    if (!tokens) {
      return res.status(401).json({ error: 'ML não conectado', auth_url: getAuthUrl() });
    }

    // Renovar token se expirado (expirar em menos de 1h)
    const expiresAt = tokens.obtained_at + (tokens.expires_in * 1000);
    if (Date.now() > expiresAt - 3600000) {
      tokens = await refreshToken(tokens, supabaseUrl, supabaseKey);
    }

    const { action } = req.query;

    // ── Ação: buscar pedidos entregues recentemente ──────────────────────────
    if (action === 'delivered_orders') {
      const daysBack = parseInt(req.query.days || '3');
      const dateFrom = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();

      const ordersRes = await fetch(
        `https://api.mercadolibre.com/orders/search?seller=${tokens.user_id}&order.status=delivered&order.date_last_updated.from=${dateFrom}&limit=50`,
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );
      const ordersData = await ordersRes.json();
      return res.status(200).json({ orders: ordersData.results || [], total: ordersData.paging?.total || 0 });
    }

    // ── Ação: enviar mensagem pós-venda ───────────────────────────────────────
    if (action === 'send_message' && req.method === 'POST') {
      const { pack_id, order_id, message } = req.body;
      const msgRes = await fetch(
        `https://api.mercadolibre.com/messages/packs/${pack_id}/sellers/${tokens.user_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: message }),
        }
      );
      const msgData = await msgRes.json();
      return res.status(msgRes.ok ? 200 : 400).json(msgData);
    }

    // ── Ação: status da conexão ───────────────────────────────────────────────
    if (action === 'status') {
      const userRes = await fetch(
        `https://api.mercadolibre.com/users/${tokens.user_id}`,
        { headers: { Authorization: `Bearer ${tokens.access_token}` } }
      );
      const userData = await userRes.json();
      return res.status(200).json({
        connected: true,
        user: userData.nickname,
        user_id: tokens.user_id,
        token_expires_at: new Date(tokens.obtained_at + tokens.expires_in * 1000).toISOString(),
      });
    }

    return res.status(400).json({ error: 'Ação não reconhecida' });

  } catch (err) {
    console.error('Erro em ml-orders:', err);
    return res.status(500).json({ error: err.message });
  }
}

function getAuthUrl() {
  return `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${process.env.ML_CLIENT_ID}&redirect_uri=${process.env.ML_REDIRECT_URI}`;
}
