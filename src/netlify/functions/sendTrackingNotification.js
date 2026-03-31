/**
 * Netlify Function: sendTrackingNotification
 * Envia email de rastreio ao cliente
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { orderId } = JSON.parse(event.body || '{}');
  if (!orderId) return { statusCode: 400, body: JSON.stringify({ error: 'orderId obrigatório' }) };

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: order } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (!order?.tracking_code || !order?.customer_email) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Código de rastreio ou email não disponível' }) };
  }

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'RLM Variedades <noreply@rlmvariedades.com.br>',
      to: order.customer_email,
      subject: `🚚 Seu pedido ${order.order_number} foi enviado!`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
          <div style="background:#0891b2;padding:24px;border-radius:8px 8px 0 0;text-align:center">
            <h2 style="color:white;margin:0">🚚 Pedido Enviado!</h2>
          </div>
          <div style="background:#f8fafc;padding:24px;border:1px solid #e2e8f0;border-radius:0 0 8px 8px">
            <p>Olá, <strong>${order.customer_name}</strong>! 👋</p>
            <p>Seu pedido <strong>${order.order_number}</strong> foi enviado pelos Correios.</p>
            <div style="background:white;border:2px solid #0891b2;border-radius:12px;padding:20px;text-align:center;margin:20px 0">
              <p style="color:#64748b;margin:0 0 8px">Código de Rastreio</p>
              <p style="font-size:26px;font-weight:bold;font-family:monospace;color:#0e7490;margin:0">${order.tracking_code}</p>
            </div>
            <p style="text-align:center">
              <a href="https://rastreamento.correios.com.br" style="background:#0891b2;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold">
                Rastrear nos Correios
              </a>
            </p>
            <p style="color:#64748b;font-size:13px">Prazo estimado: 7 a 15 dias úteis após o envio.</p>
          </div>
        </div>
      `,
    }),
  });

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};