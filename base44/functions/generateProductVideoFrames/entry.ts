import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { productIds } = body;

    if (!productIds || productIds.length === 0) {
      return Response.json({ error: 'productIds é obrigatório' }, { status: 400 });
    }

    const results = [];

    for (const productId of productIds) {
      try {
        const product = await base44.asServiceRole.entities.Product.get(productId);
        if (!product) continue;

        console.log(`Gerando frames para: ${product.name}`);

        // Gerar 30 frames de demonstração do produto
        const prompts = [
          `High-quality product demonstration video frame 1/30: Close-up of ${product.name} on white background, professional studio lighting`,
          `Product video frame 2/30: Full product view of ${product.name}, 45-degree angle`,
          `Product video frame 3/30: ${product.name} in use, hands holding it, lifestyle shot`,
          `Product video frame 4/30: Detail shot of ${product.name} features and specifications`,
          `Product video frame 5/30: ${product.name} surrounded by lifestyle props, bright and inviting`,
          `Product video frame 6/30: Top-down view of ${product.name}, clean minimalist background`,
          `Product video frame 7/30: Side profile of ${product.name}, professional product photography`,
          `Product video frame 8/30: ${product.name} being demonstrated by hands, action shot`,
          `Product video frame 9/30: Close-up texture and material details of ${product.name}`,
          `Product video frame 10/30: ${product.name} in modern home environment, lifestyle context`,
          `Product video frame 11/30: Packaging and unboxing view of ${product.name}`,
          `Product video frame 12/30: ${product.name} with complementary products, bundle shot`,
          `Product video frame 13/30: Detailed feature highlight of ${product.name}`,
          `Product video frame 14/30: ${product.name} in professional workspace, office setting`,
          `Product video frame 15/30: Three-quarter view of ${product.name}, studio lighting`,
          `Product video frame 16/30: ${product.name} showing size comparison with hand`,
          `Product video frame 17/30: Color variants of ${product.name} lined up`,
          `Product video frame 18/30: ${product.name} in action, motion blur effect`,
          `Product video frame 19/30: Close inspection of ${product.name} quality and craftsmanship`,
          `Product video frame 20/30: ${product.name} placed on premium surface, luxury presentation`,
          `Product video frame 21/30: User interface or controls of ${product.name}`,
          `Product video frame 22/30: ${product.name} from flat lay perspective, organized arrangement`,
          `Product video frame 23/30: Dynamic product shot of ${product.name}, movement captured`,
          `Product video frame 24/30: ${product.name} benefits infographic frame`,
          `Product video frame 25/30: Real customer using ${product.name}, authenticity`,
          `Product video frame 26/30: ${product.name} precision and engineering details`,
          `Product video frame 27/30: Premium unboxing experience of ${product.name}`,
          `Product video frame 28/30: ${product.name} durability and reliability demonstration`,
          `Product video frame 29/30: Customer satisfaction moment with ${product.name}`,
          `Product video frame 30/30: Final hero shot of ${product.name}, call-to-action focused`
        ];

        const frames = [];
        for (let i = 0; i < prompts.length; i++) {
          try {
            const imageRes = await base44.integrations.Core.GenerateImage({
              prompt: prompts[i]
            });
            if (imageRes?.url) {
              frames.push(imageRes.url);
              console.log(`  ✓ Frame ${i + 1}/30 gerado`);
            }
          } catch (imgErr) {
            console.warn(`  ✗ Frame ${i + 1} falhou: ${imgErr.message}`);
          }
          
          // Pequeno delay para evitar rate limit
          await new Promise(r => setTimeout(r, 500));
        }

        if (frames.length > 0) {
          await base44.asServiceRole.entities.Product.update(productId, {
            video_frames: frames
          });
          results.push({ productId, name: product.name, framesGenerated: frames.length });
          console.log(`✅ ${product.name}: ${frames.length}/30 frames salvos`);
        }
      } catch (productErr) {
        console.error(`Erro ao processar ${productId}:`, productErr.message);
        results.push({ productId, error: productErr.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});