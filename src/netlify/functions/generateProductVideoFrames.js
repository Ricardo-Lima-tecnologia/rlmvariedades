/**
 * Netlify Function: generateProductVideoFrames
 * Gera 30 frames de demonstração via OpenAI DALL-E
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function generateImage(prompt) {
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'dall-e-3', prompt, n: 1, size: '1024x1024' }),
  });
  const data = await res.json();
  return data.data?.[0]?.url;
}

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { productIds } = JSON.parse(event.body || '{}');
  if (!productIds?.length) {
    return { statusCode: 400, body: JSON.stringify({ error: 'productIds obrigatório' }) };
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  const results = [];

  for (const productId of productIds) {
    const { data: product } = await supabase.from('products').select('*').eq('id', productId).single();
    if (!product) { results.push({ productId, error: 'Produto não encontrado' }); continue; }

    const frames = [];
    const angles = [
      'front view', 'side view', 'top view', 'close-up detail', 'lifestyle in use',
      'different angle', 'packaging', 'scale reference', 'feature highlight', 'beauty shot',
    ];

    for (let i = 0; i < 10; i++) {
      const prompt = `Professional product photography of: ${product.name}. ${product.short_description || ''}. ${angles[i % angles.length]}, white background, studio lighting, high quality, 4k`;
      try {
        const url = await generateImage(prompt);
        if (url) frames.push(url);
        await new Promise(r => setTimeout(r, 500));
      } catch { /* skip frame */ }
    }

    await supabase.from('products').update({ video_frames: frames }).eq('id', productId);
    results.push({ productId, framesGenerated: frames.length });
  }

  return { statusCode: 200, body: JSON.stringify({ results }) };
};