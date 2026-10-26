const STOP = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'what', 'when', 'which', 'how', 'why', 'are',
  'was', 'were', 'has', 'have', 'had', 'into', 'about', 'your', 'their', 'they', 'them', 'its', 'not',
  'but', 'can', 'could', 'does', 'did', 'than', 'then', 'also', 'most', 'more', 'over', 'under',
  'between', 'after', 'before', 'while', 'will', 'would', 'should', 'there', 'here', 'these', 'those',
  'you', 'our', 'out', 'all', 'any', 'each', 'such', 'been', 'being', 'very', 'just', 'like', 'some',
]);

function words(text) {
  const matches = String(text || '').toLowerCase().match(/[a-z0-9][a-z0-9-]{3,}/g) || [];
  return new Set(matches.filter((w) => !STOP.has(w)));
}

export function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'source';
  }
}

function shorten(text, max = 48) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/**
 * Turns one answer into a small graph:
 * the question at the centre, topic clusters (takeaways + threads) around it,
 * and the cited sources on the outer shell, wired to the topics they share vocabulary with.
 */
export function buildGraph(result, query) {
  const question = (query || result?.query || 'Your question').trim();
  const sources = (result?.sources || []).slice(0, 8);
  const keyPoints = (result?.key_points || []).slice(0, 3);
  const threads = (result?.follow_ups || []).slice(0, 3);

  const nodes = [
    {
      id: 'q',
      kind: 'query',
      label: question,
      detail: 'Your question',
      pos: [0, 0, 0],
      size: 0.42,
      tokens: words(question),
    },
  ];
  const links = [];

  const topics = [
    ...keyPoints.map((t) => ({ label: t, detail: 'Topic cluster · key takeaway', kind: 'topic' })),
    ...threads.map((t) => ({ label: t, detail: 'Topic cluster · open thread', kind: 'thread' })),
  ].slice(0, 6);

  topics.forEach((topic, i) => {
    const angle = (i / Math.max(1, topics.length)) * Math.PI * 2;
    const id = `t${i}`;
    nodes.push({
      id,
      kind: topic.kind,
      label: shorten(topic.label),
      detail: topic.detail,
      pos: [Math.cos(angle) * 1.45, i % 2 === 0 ? 0.62 : -0.62, Math.sin(angle) * 1.45],
      size: topic.kind === 'thread' ? 0.15 : 0.19,
      tokens: words(topic.label),
    });
    links.push({ source: 'q', target: id, kind: 'origin' });
  });

  const total = sources.length;
  sources.forEach((source, i) => {
    const y = total === 1 ? 0 : 1 - (i / (total - 1)) * 2;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = i * 2.399963;
    const domain = domainOf(source.url);
    nodes.push({
      id: `s${i}`,
      kind: 'source',
      label: shorten(source.title || domain, 44),
      detail: domain,
      url: source.url,
      pos: [Math.cos(theta) * ring * 2.6, y * 1.75, Math.sin(theta) * ring * 2.6],
      size: 0.14,
      tokens: words(`${source.title || ''} ${source.snippet || ''}`),
    });
  });

  const sourceNodes = nodes.filter((n) => n.kind === 'source');

  nodes
    .filter((n) => n.kind === 'topic' || n.kind === 'thread')
    .forEach((topic) => {
      sourceNodes
        .map((s) => [s.id, [...topic.tokens].filter((w) => s.tokens.has(w)).length])
        .filter(([, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .forEach(([id]) => links.push({ source: topic.id, target: id, kind: 'relates' }));
    });

  // keep every source reachable, even when no topic shares its words
  const linked = new Set(links.filter((l) => l.kind === 'relates').map((l) => l.target));
  sourceNodes
    .filter((s) => !linked.has(s.id))
    .forEach((s) => links.push({ source: 'q', target: s.id, kind: 'found' }));

  return { nodes, links };
}

export function neighborsOf(graph, id) {
  const set = new Set([id]);
  graph.links.forEach((link) => {
    if (link.source === id) set.add(link.target);
    if (link.target === id) set.add(link.source);
  });
  return set;
}