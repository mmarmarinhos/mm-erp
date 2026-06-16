// api/ml-webhook.js
// Recebe notificações do ML sobre pedidos, mensagens e envios
// Apenas confirma o recebimento - o processamento real acontece via polling em ml-orders.js

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

    // ML exige resposta 200 imediata (timeout de 500ms)
    // O processamento de pedidos entregues é feito via polling em ml-orders.js
    return res.status(200).json({ status: 'received' });

  } catch (err) {
    console.error('Erro no webhook ML:', err);
    // Mesmo com erro, retornar 200 para ML não reenviar
    return res.status(200).json({ status: 'error', message: err.message });
  }
}
