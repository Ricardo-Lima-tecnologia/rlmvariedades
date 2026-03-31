/**
 * Netlify Function: createPayment
 * Substituto da função Deno createPayment
 */

const MERCADOPAGO_ACCESS_TOKEN = process.env.MERCADOPAGO_ACCESS_TOKEN;
const MP_API = 'https://api.mercadopago.com/v1/payments';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { orderId, paymentMethod, cardToken, installments, payerEmail, payerDocument } = JSON.parse(event.body || '{}');

  // Buscar pedido no Supabase
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: order, error } = await supabase.from('orders').select('*').eq('id', orderId).single();
  if (error || !order) {
    return { statusCode: 404, body: JSON.stringify({ error: 'Pedido não encontrado' }) };
  }

  let paymentPayload;

  if (paymentMethod === 'pix') {
    paymentPayload = {
      transaction_amount: order.total,
      payment_method_id: 'pix',
      payer: {
        email: payerEmail,
        identification: { type: 'CPF', number: payerDocument?.replace(/\D/g, '') },
      },
    };
  } else {
    paymentPayload = {
      transaction_amount: order.total,
      token: cardToken,
      installments: installments || 1,
      payment_method_id: 'credit_card',
      payer: {
        email: payerEmail,
        identification: { type: 'CPF', number: payerDocument?.replace(/\D/g, '') },
      },
    };
  }

  const mpRes = await fetch(MP_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${MERCADOPAGO_ACCESS_TOKEN}`,
      'X-Idempotency-Key': `${orderId}-${Date.now()}`,
    },
    body: JSON.stringify(paymentPayload),
  });

  const payment = await mpRes.json();

  const statusMap = { approved: 'confirmed', pending: 'pending', rejected: 'cancelled', in_process: 'pending' };
  const newStatus = statusMap[payment.status] || 'pending';

  await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

  if (payment.status === 'approved') {
    return {
      statusCode: 200,
      body: JSON.stringify({ approved: true, payment_id: payment.id }),
    };
  }

  if (paymentMethod === 'pix' && payment.point_of_interaction) {
    return {
      statusCode: 200,
      body: JSON.stringify({
        approved: false,
        pix: true,
        qr_code: payment.point_of_interaction.transaction_data?.qr_code,
        qr_code_base64: payment.point_of_interaction.transaction_data?.qr_code_base64,
        payment_id: payment.id,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ approved: false, error: payment.status_detail || 'Pagamento não aprovado' }),
  };
};