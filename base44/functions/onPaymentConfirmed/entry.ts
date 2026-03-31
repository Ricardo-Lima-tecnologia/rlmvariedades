import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const order = body.data;
    if (!order) return Response.json({ ok: true });

    const adminEmail = 'ricardo.limatecnologia@gmail.com';

    // Notificação para o ADMIN quando pagamento for confirmado
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: adminEmail,
      from_name: 'RLM Variedades - Sistema',
      subject: `✅ Pagamento Confirmado: ${order.order_number} — R$ ${(order.total || 0).toFixed(2).replace('.', ',')}`,
      body: `
        <div style="font-family:Arial,sans-serif;max-width:500px">
          <h2 style="color:#16a34a">💰 Pagamento Recebido!</h2>
          <p style="color:#166534;background:#dcfce7;padding:12px;border-radius:8px">
            O pagamento do pedido <strong>${order.order_number}</strong> foi confirmado com sucesso.
          </p>
          <table style="width:100%;border-collapse:collapse;margin-top:16px">
            <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px"><strong>Pedido:</strong></td><td style="padding:8px">${order.order_number}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px"><strong>Cliente:</strong></td><td style="padding:8px">${order.customer_name}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px"><strong>Email:</strong></td><td style="padding:8px">${order.customer_email}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px"><strong>Telefone:</strong></td><td style="padding:8px">${order.customer_phone || '-'}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px"><strong>Pagamento:</strong></td><td style="padding:8px">${order.payment_method?.replace('_', ' ') || '-'}</td></tr>
            <tr style="border-bottom:1px solid #e5e7eb"><td style="padding:8px"><strong>Total:</strong></td><td style="padding:8px;color:#16a34a;font-weight:bold;font-size:18px">R$ ${(order.total || 0).toFixed(2).replace('.', ',')}</td></tr>
            <tr><td style="padding:8px"><strong>Endereço:</strong></td><td style="padding:8px">${order.shipping_address ? `${order.shipping_address.street}, ${order.shipping_address.number} — ${order.shipping_address.city}/${order.shipping_address.state}` : '-'}</td></tr>
          </table>
          ${(order.items || []).length > 0 ? `
          <h3 style="margin-top:16px">Itens do Pedido:</h3>
          <ul style="padding-left:20px">
            ${(order.items || []).map(i => `<li>${i.product_name} x${i.quantity} — R$ ${((i.price || 0) * i.quantity).toFixed(2).replace('.', ',')}</li>`).join('')}
          </ul>` : ''}
          <p style="margin-top:16px;color:#6b7280">Acesse o painel admin para preparar e enviar o pedido.</p>
        </div>
      `
    });

    // Email de confirmação para o CLIENTE
    if (order.customer_email) {
      const addr = order.shipping_address || {};
      const addrStr = addr.street
        ? `${addr.street}, ${addr.number}${addr.complement ? ' ' + addr.complement : ''} — ${addr.neighborhood}, ${addr.city}/${addr.state} — CEP ${addr.zip_code}`
        : 'Não informado';

      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.customer_email,
        from_name: 'RLM Variedades',
        subject: `✅ Pedido ${order.order_number} confirmado! Obrigado pela sua compra`,
        body: `
          <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
            <div style="background:#1d4ed8;padding:24px;border-radius:8px 8px 0 0;text-align:center">
              <h2 style="color:white;margin:0;font-size:22px">🎉 Pedido Confirmado!</h2>
              <p style="color:#bfdbfe;margin:6px 0 0;font-size:14px">Seu pagamento foi aprovado com sucesso</p>
            </div>
            <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0">
              <p style="color:#1e293b;margin:0 0 16px">Olá, <strong>${order.customer_name}</strong>! 👋</p>
              <p style="color:#475569;margin:0 0 20px">Seu pedido foi confirmado e já está sendo preparado para envio. Abaixo estão os detalhes:</p>

              <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
                <tr style="border-bottom:1px solid #e2e8f0">
                  <td style="padding:10px 8px;color:#64748b;width:40%">Número do Pedido</td>
                  <td style="padding:10px 8px;font-weight:bold;color:#1d4ed8">${order.order_number}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0">
                  <td style="padding:10px 8px;color:#64748b">Pagamento</td>
                  <td style="padding:10px 8px">${order.payment_method?.replace('_', ' ') || '-'}</td>
                </tr>
                <tr style="border-bottom:1px solid #e2e8f0">
                  <td style="padding:10px 8px;color:#64748b">Endereço de Entrega</td>
                  <td style="padding:10px 8px;font-size:13px">${addrStr}</td>
                </tr>
                <tr>
                  <td style="padding:10px 8px;color:#64748b">Total Pago</td>
                  <td style="padding:10px 8px;font-size:20px;font-weight:bold;color:#16a34a">R$ ${(order.total || 0).toFixed(2).replace('.', ',')}</td>
                </tr>
              </table>

              ${(order.items || []).length > 0 ? `
              <div style="margin-bottom:20px">
                <p style="font-weight:bold;color:#1e293b;margin:0 0 10px">Itens do Pedido:</p>
                <div style="background:white;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">
                  ${(order.items || []).map(i => `
                    <div style="padding:10px 14px;border-bottom:1px solid #f1f5f9;display:flex;justify-content:space-between">
                      <span style="color:#374151">${i.product_name} x${i.quantity}</span>
                      <span style="font-weight:bold">R$ ${((i.price || 0) * i.quantity).toFixed(2).replace('.', ',')}</span>
                    </div>
                  `).join('')}
                </div>
              </div>` : ''}

              <div style="background:#eff6ff;border-radius:8px;border-left:4px solid #1d4ed8;padding:14px;margin-bottom:20px">
                <p style="margin:0;color:#1e40af;font-size:13px">📦 Assim que seu pedido for enviado, você receberá um email com o código de rastreio dos Correios.</p>
              </div>

              <p style="color:#64748b;font-size:13px;margin:0">Dúvidas? Entre em contato pelo WhatsApp ou acesse nosso site para rastrear seu pedido.</p>
            </div>
          </div>
        `
      });
    }

    console.log(`Confirmação enviada para pedido ${order.order_number} — admin e cliente notificados`);
    return Response.json({ ok: true });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});