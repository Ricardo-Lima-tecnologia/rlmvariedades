import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const order = body.data;
    if (!order || !order.tracking_code || !order.customer_email) {
      console.log('Dados incompletos:', { order_id: order?.id, tracking_code: order?.tracking_code, email: order?.customer_email });
      return Response.json({ ok: true });
    }

    // Usar integração Core diretamente via fetch
    const emailBody = `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto">
        <div style="background:#0891b2;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h2 style="color:white;margin:0;font-size:22px">🚚 Pedido Enviado!</h2>
          <p style="color:#cffafe;margin:6px 0 0;font-size:14px">Seu pedido está a caminho</p>
        </div>
        <div style="background:#f8fafc;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e2e8f0">
          <p style="color:#1e293b;margin:0 0 16px">Olá, <strong>${order.customer_name || 'Cliente'}</strong>! 👋</p>
          <p style="color:#475569;margin:0 0 20px">Ótimas notícias! Seu pedido <strong>${order.order_number}</strong> foi enviado pelos Correios e já está a caminho.</p>

          <div style="background:white;border:2px solid #0891b2;border-radius:12px;padding:20px;text-align:center;margin-bottom:20px">
            <p style="color:#64748b;margin:0 0 8px;font-size:13px">Código de Rastreio</p>
            <p style="font-size:26px;font-weight:bold;font-family:monospace;color:#0e7490;margin:0;letter-spacing:2px">${order.tracking_code}</p>
          </div>

          <div style="text-align:center;margin-bottom:20px">
            <a href="https://rastreamento.correios.com.br/app/index.php" target="_blank" style="background:#0891b2;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:14px;display:inline-block">
              Rastrear pelo site dos Correios
            </a>
          </div>

          <div style="background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a;padding:14px;margin-bottom:16px">
            <p style="margin:0;color:#15803d;font-size:13px">⏱️ Prazo estimado de entrega: 7 a 15 dias úteis após o envio.</p>
          </div>

          <p style="color:#64748b;font-size:13px;margin:0">Você também pode rastrear diretamente no nosso site em <strong>Rastrear Pedido</strong>.</p>
        </div>
      </div>
    `;

    try {
      await base44.integrations.Core.SendEmail({
        to: order.customer_email,
        from_name: 'RLM Variedades',
        subject: `🚚 Seu pedido ${order.order_number} foi enviado! Rastreie agora`,
        body: emailBody
      });
      console.log(`✅ Email enviado para ${order.customer_email} — pedido ${order.order_number}`);
    } catch (emailError) {
      console.warn(`⚠️ SendEmail failed: ${emailError.message}. Continuando...`);
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error('Erro na automação:', error.message);
    return Response.json({ ok: true }); // Retorna ok para não bloquear a atualização do pedido
  }
});