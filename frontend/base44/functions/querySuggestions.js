export default async function (req) {
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim() : (body.partial || '');

    const res = await fetch('http://localhost:5000/api/suggestions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    if (res.ok) {
      const data = await res.json();
      return Response.json(data);
    }

    throw new Error(`Suggestions backend returned ${res.status}`);
  } catch {
    return Response.json({
      suggestions: [
        'Artificial intelligence advancements 2026',
        'Quantum computing architecture',
        'Full-stack Next.js and Vite best practices',
        'Private local search engines setup',
      ],
    });
  }
}
