import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { trackingCode } = await req.json();

    if (!trackingCode) {
      return Response.json({ error: 'Código de rastreio obrigatório' }, { status: 400 });
    }

    // API pública dos Correios (rastro.correios.com.br)
    const url = `https://proxyapp.correios.com.br/v1/sro-rastro/${trackingCode.toUpperCase()}`;

    const res = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0',
      },
    });

    if (!res.ok) {
      // Fallback: tenta via API alternativa
      const fallback = await fetch(`https://api.linketrack.com/track/json?user=teste&token=1abcd00b2731640e886fb41a8a9671ad1434c599dbaa0a0de9a5aa619f29a83f&codigo=${trackingCode.toUpperCase()}`);
      if (fallback.ok) {
        const data = await fallback.json();
        const events = (data.eventos || []).map(e => ({
          date: e.data,
          time: e.hora,
          description: e.descricao,
          location: e.local || '',
          status: e.status || '',
        }));
        return Response.json({ events, source: 'linketrack' });
      }
      return Response.json({ error: 'Não foi possível rastrear o objeto. Verifique o código e tente novamente.' }, { status: 404 });
    }

    const data = await res.json();
    const objetos = data.objetos || [];

    if (!objetos.length) {
      return Response.json({ error: 'Objeto não encontrado nos Correios.' }, { status: 404 });
    }

    const obj = objetos[0];
    const eventos = obj.eventos || [];

    const events = eventos.map(e => ({
      date: e.dtHrCriado ? e.dtHrCriado.split('T')[0] : '',
      time: e.dtHrCriado ? e.dtHrCriado.split('T')[1]?.slice(0, 5) : '',
      description: e.descricao || e.detalhe || '',
      location: e.unidade?.endereco
        ? `${e.unidade.nome || ''} - ${e.unidade.endereco.municipio || ''}, ${e.unidade.endereco.uf || ''}`
        : e.unidade?.nome || '',
      status: e.codigo || '',
    }));

    return Response.json({ events, trackingCode: obj.codObjeto, source: 'correios' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});