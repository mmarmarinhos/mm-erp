// api/ml-webhook.js
// Recebe notificações do ML sobre pedidos, mensagens e envios

export default async function handler(req, res) {
  // ML envia um GET para validar o endpoint
  if (req.method === 'GET') {
    return res.status(200).json({ status: 'ok', service: 'MM ERP ML Webhook' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const notification = req.body;
    console.log('Notificação ML recebida:', JSON.stringify(notification));

    const { topic, resource, user_id } = notification;

    // Processar apenas notificações de pedidos
    if (topic === 'orders_v2' || topic === 'shipments') {
      const supabaseUrl = process.env.VITE_SUPABASE_URL;
      const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

      // Salvar notificação na fila para processamento
      await fetch(`${supabaseUrl}/rest/v1/kv_store`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          key: `ml_notification_${Date.now()}`,
          value: JSON.stringify({ topic, resource, user_id, received_at: new Date().toISOString() }),
        }),
      });
    }

    // ML exige resposta 200 imediata
    return res.status(200).json({ status: 'received' });

  } catch (err) {
    console.error('Erro no webhook ML:', err);
    // Mesmo com erro, retornar 200 para ML não reenviar
    return res.status(200).json({ status: 'error', message: err.message });
  }
}
