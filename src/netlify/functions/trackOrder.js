/**
 * Netlify Function: trackOrder
 * Consulta rastreamento nos Correios
 */

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const { trackingCode } = JSON.parse(event.body || '{}');
  if (!trackingCode) {
    return { statusCode: 400, body: JSON.stringify({ error: 'trackingCode obrigatório' }) };
  }

  try {
    const res = await fetch(`https://api.linketrack.com/track/json?user=teste&token=1abcd00b2731640a&codigo=${trackingCode}`);
    const data = await res.json();

    if (!data || data.quantidade === 0) {
      return {
        statusCode: 200,
        body: JSON.stringify({ events: [], message: 'Nenhum evento encontrado para este código.' }),
      };
    }

    const events = (data.eventos || []).map(e => ({
      description: e.descricao,
      location: e.detalhe || e.unidade?.local || '',
      date: e.data,
      time: e.hora,
    }));

    return { statusCode: 200, body: JSON.stringify({ events }) };
  } catch {
    return {
      statusCode: 200,
      body: JSON.stringify({ error: 'Não foi possível consultar o rastreamento. Tente novamente mais tarde.' }),
    };
  }
};