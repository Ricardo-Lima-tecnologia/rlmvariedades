/**
 * Netlify Function: onNewOrder
 * Chamada ao criar um pedido — envia email admin + atualiza estoque
 * Substituto da função Deno onNewOrder
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const ADMIN_EMAIL = 'ricardo.limatecnologia@gmail.com';

async function sendEmail(to, subject, html) {
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: 'RLM Variedades <noreply@rlmvariedades.com.br>', to, subject, html }),
  });
}

export const handler = async (event) => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const order = JSON.parse(event.body || '{}');
  if (!order?.id) return { statusCode: 200, body: '{"ok":true}' };

  const paymentLabels = { pix: '🟢 Pix', credit_card: '💳 Cartão', boleto: '📄 Boleto' };

  await sendEmail(
    ADMIN_EMAIL,
    `🛒 Nova Venda: ${order.order_number} — R$ ${(order.total || 0).toFixed(2).replace('.', ',')}`,
    `<div style="font-family:Arial,sans-serif;max-width:520px">
      <h2 style="color:#1d4ed8">🛒 Nova venda iniciada</h2>
      <p><b>Pedido:</b> ${order.order_number}</p>
      <p><b>Cliente:</b> ${order.customer_name}</p>
      <p><b>Email:</b> ${order.customer_email}</p>
      <p><b>Pagamento:</b> ${paymentLabels[order.payment_method] || '-'}</p>
      <p><b>Total:</b> R$ ${(order.total || 0).toFixed(2).replace('.', ',')}</p>
    </div>`
  );

  // Atualizar estoque
  for (const item of (order.items || [])) {
    if (!item.product_id) continue;
    const { data: product } = await supabase.from('products').select('*').eq('id', item.product_id).single();
    if (product) {
      const newQty = Math.max(0, (product.stock_quantity || 0) - item.quantity);
      const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 5 ? 'low_stock' : 'in_stock';
      await supabase.from('products').update({ stock_quantity: newQty, stock_status: newStatus }).eq('id', item.product_id);
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
};