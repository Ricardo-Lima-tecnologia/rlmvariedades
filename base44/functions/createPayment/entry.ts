import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const MP_TOKEN = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
const MP_BASE = 'https://api.mercadopago.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { orderId, paymentMethod, cardToken, installments, payerEmail, payerDocument } = body;

    // Buscar pedido
    const orders = await base44.asServiceRole.entities.Order.filter({ id: orderId });
    if (!orders.length) return Response.json({ error: 'Pedido não encontrado' }, { status: 404 });
    const order = orders[0];

    const orderTotal = Number((order.total || 0).toFixed(2));
    if (!orderTotal) return Response.json({ error: 'Total do pedido inválido' }, { status: 400 });

    let paymentData = {
      transaction_amount: orderTotal,
      description: `Pedido ${order.order_number} - RLM Variedades`,
      external_reference: order.order_number,
      payer: {
        email: payerEmail || order.customer_email,
        identification: {
          type: 'CPF',
          number: payerDocument || order.customer_cpf?.replace(/\D/g, ''),
        },
      },
    };

    if (paymentMethod === 'pix') {
      paymentData.payment_method_id = 'pix';
    } else if (paymentMethod === 'credit_card') {
      paymentData.token = cardToken;
      paymentData.installments = installments || 1;
      // payment_method_id é detectado automaticamente pelo MP via token do cartão
      paymentData.capture = true;
    }

    const mpRes = await fetch(`${MP_BASE}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `rlm-${order.order_number}-${Date.now()}`,
      },
      body: JSON.stringify(paymentData),
    });

    const payment = await mpRes.json();

    if (!mpRes.ok) {
      console.error('MP Error:', JSON.stringify(payment));
      return Response.json({ error: payment.message || 'Erro ao criar pagamento', detail: payment }, { status: 400 });
    }

    // Atualizar pedido com dados do pagamento
    const newStatus = payment.status === 'approved' ? 'confirmed' : 'pending';
    await base44.asServiceRole.entities.Order.update(order.id, {
      status: newStatus,
      payment_id: String(payment.id),
      payment_status: payment.status,
    });

    return Response.json({
      paymentId: payment.id,
      status: payment.status,
      // Pix
      pixQrCode: payment.point_of_interaction?.transaction_data?.qr_code,
      pixQrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
      // Cartão
      approved: payment.status === 'approved',
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});