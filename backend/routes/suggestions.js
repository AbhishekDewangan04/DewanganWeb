import { Router } from 'express';

const router = Router();

const AUTOCOMPLETE_ENDPOINTS = [
  'http://localhost:8080',
  'https://searx.be',
  'https://searx.space',
];

async function fetchAutocomplete(query) {
  const encoded = encodeURIComponent(query);
  for (const base of AUTOCOMPLETE_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${base}/autocompleter?q=${encoded}&format=json`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        // SearXNG autocompleter usually returns an array of strings or [query, [suggestions]]
        if (Array.isArray(data)) {
          if (Array.isArray(data[1])) {
            return data[1].slice(0, 4);
          }
          return data.filter((s) => typeof s === 'string').slice(0, 4);
        }
      }
    } catch {
      continue;
    }
  }
  return null;
}

function generateSmartSuggestions(query) {
  const q = String(query || '').trim();
  if (!q) {
    return [
      'Artificial intelligence advancements 2026',
      'Quantum computing architecture',
      'Full-stack Next.js and Vite best practices',
      'Private local search engines setup',
    ];
  }

  return [
    `${q} overview and architecture`,
    `${q} practical tutorial and examples`,
    `${q} performance benchmarks vs alternatives`,
    `${q} best practices and common pitfalls`,
  ];
}

router.post('/', async (req, res) => {
  try {
    const rawQuery = req.body?.query || req.body?.partial || '';
    const query = String(rawQuery).trim();

    let suggestions = null;
    if (query.length >= 2) {
      try {
        suggestions = await fetchAutocomplete(query);
      } catch {
        suggestions = null;
      }
    }

    if (!suggestions || suggestions.length === 0) {
      suggestions = generateSmartSuggestions(query);
    }

    // Ensure exactly 4 suggestions are returned as requested
    const formattedSuggestions = suggestions.slice(0, 4);

    return res.json({
      query,
      suggestions: formattedSuggestions,
    });
  } catch (error) {
    console.error('Suggestions error in /api/suggestions:', error);
    return res.json({
      query: req.body?.query || '',
      suggestions: generateSmartSuggestions(req.body?.query || ''),
    });
  }
});

export default router;
