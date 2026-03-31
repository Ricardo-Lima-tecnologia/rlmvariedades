import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const order = body.data;
    if (!order) return Response.json({ ok: true });

    const adminEmail = 'ricardo.limatecnologia@gmail.com';

    const paymentLabels = {
      pix: '🟢 Pix',
      credit_card: '💳 Cartão de Crédito',
      boleto: '📄 Boleto Bancário',
    };

    const paymentLabel = paymentLabels[order.payment_method] || order.payment_method || '-';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: adminEmail,
      from_name: 'RLM Variedades',
      subject: `🛒 Nova Venda Iniciada: ${order.order_number} — R$ ${(order.total || 0).toFixed(2).replace('.', ',')}`,
      body: `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto">
          <div style="background:#1d4ed8;padding:20px;border-radius:8px 8px 0 0">
            <h2 style="color:white;margin:0">🛒 RLM Variedades</h2>
            <p style="color:#bfdbfe;margin:4px 0 0">Nova venda iniciada no sistema</p>
          </div>
          <div style="background:#f8fafc;padding:20px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0">
            <table style="width:100%;border-collapse:collapse">
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:10px 8px;color:#64748b">Pedido</td>
                <td style="padding:10px 8px;font-weight:bold">${order.order_number}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:10px 8px;color:#64748b">Cliente</td>
                <td style="padding:10px 8px">${order.customer_name}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:10px 8px;color:#64748b">Email</td>
                <td style="padding:10px 8px">${order.customer_email}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:10px 8px;color:#64748b">Telefone</td>
                <td style="padding:10px 8px">${order.customer_phone || '-'}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:10px 8px;color:#64748b">Pagamento</td>
                <td style="padding:10px 8px">${paymentLabel}</td>
              </tr>
              <tr style="border-bottom:1px solid #e2e8f0">
                <td style="padding:10px 8px;color:#64748b">Itens</td>
                <td style="padding:10px 8px">${(order.items || []).length} produto(s)</td>
              </tr>
              <tr>
                <td style="padding:10px 8px;color:#64748b">Total</td>
                <td style="padding:10px 8px;font-size:20px;font-weight:bold;color:#1d4ed8">
                  R$ ${(order.total || 0).toFixed(2).replace('.', ',')}
                </td>
              </tr>
            </table>

            ${(order.items || []).length > 0 ? `
            <div style="margin-top:16px">
              <p style="font-weight:bold;color:#1e293b;margin-bottom:8px">Itens do Pedido:</p>
              <ul style="padding-left:20px;margin:0">
                ${(order.items || []).map(i => `<li style="margin-bottom:4px">${i.product_name} x${i.quantity} — R$ ${((i.price || 0) * i.quantity).toFixed(2).replace('.', ',')}</li>`).join('')}
              </ul>
            </div>` : ''}

            <div style="margin-top:20px;padding:12px;background:#eff6ff;border-radius:6px;border-left:4px solid #1d4ed8">
              <p style="margin:0;color:#1e40af;font-size:13px">
                Acesse o painel admin para acompanhar e gerenciar este pedido.
              </p>
            </div>
          </div>
        </div>
      `
    });

    // Atualizar estoque dos produtos
    for (const item of (order.items || [])) {
      if (!item.product_id) continue;
      try {
        const product = await base44.asServiceRole.entities.Product.get(item.product_id);
        if (product) {
          const newQty = Math.max(0, (product.stock_quantity || 0) - item.quantity);
          const newStatus = newQty === 0 ? 'out_of_stock' : newQty <= 5 ? 'low_stock' : 'in_stock';
          await base44.asServiceRole.entities.Product.update(product.id, {
            stock_quantity: newQty,
            stock_status: newStatus,
          });
        }
      } catch (e) {
        console.error('Erro ao atualizar estoque:', item.product_id, e.message);
      }
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});