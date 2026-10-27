export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : '';
    const mode = body.mode || 'web';

    if (!query) {
      return Response.json({ error: 'Search query is required' }, { status: 400 });
    }

    const res = await fetch('http://localhost:5000/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, mode }),
    });

    if (res.ok) {
      const data = await res.json();
      return Response.json(data);
    }

    throw new Error(`Backend search responded with status ${res.status}`);
  } catch (error) {
    return Response.json({
      query: '',
      mode: 'web',
      takeaway: 'Offline synthesis fallback active.',
      key_points: ['Fallback search response active.'],
      answer: 'Live search service unavailable. Please check the backend.',
      sources: [],
      followUps: [],
      follow_ups: [],
      codeBlock: null,
      error: error.message,
    });
  }
}
