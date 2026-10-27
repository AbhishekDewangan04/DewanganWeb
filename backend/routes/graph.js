import { Router } from 'express';

const router = Router();

function generateGraphData(query, sources = [], keyPoints = []) {
  const cleanQ = String(query || 'Knowledge Core').trim();
  const nodes = [
    {
      id: '1',
      label: cleanQ,
      type: 'main',
      group: 'center',
      val: 24,
    },
  ];
  const edges = [];

  // Generate concept sub-topics based on query
  const subConcepts = [
    { label: `${cleanQ} Architecture`, relation: 'defines architecture of' },
    { label: `${cleanQ} Best Practices`, relation: 'governed by' },
    { label: `${cleanQ} Trade-offs & Limits`, relation: 'evaluates trade-offs of' },
    { label: `${cleanQ} Real-World Tooling`, relation: 'implemented via' },
  ];

  subConcepts.forEach((concept, idx) => {
    const conceptId = String(idx + 2); // '2', '3', '4', '5'
    nodes.push({
      id: conceptId,
      label: concept.label,
      type: 'concept',
      group: 'concept',
      val: 18,
    });
    edges.push({
      source: '1',
      target: conceptId,
      relation: concept.relation || 'relates to',
    });
  });

  // Wire sources as evidence nodes
  const activeSources = Array.isArray(sources) && sources.length > 0 ? sources.slice(0, 4) : [];
  activeSources.forEach((src, idx) => {
    const sourceId = `src-${idx + 1}`;
    const domain = src.domain || 'source';
    nodes.push({
      id: sourceId,
      label: `${domain}: ${src.title ? src.title.slice(0, 32) : `Source ${idx + 1}`}`,
      type: 'evidence',
      group: 'evidence',
      url: src.url || '#',
      val: 12,
    });

    // Connect source to a concept node
    const targetConceptId = String((idx % subConcepts.length) + 2);
    edges.push({
      source: targetConceptId,
      target: sourceId,
      relation: 'cites evidence from',
    });
  });

  // Wire key takeaway points if provided
  if (Array.isArray(keyPoints) && keyPoints.length > 0) {
    keyPoints.slice(0, 3).forEach((point, idx) => {
      const pointId = `takeaway-${idx + 1}`;
      nodes.push({
        id: pointId,
        label: point.length > 36 ? `${point.slice(0, 35)}...` : point,
        type: 'takeaway',
        group: 'takeaway',
        val: 14,
      });
      edges.push({
        source: '1',
        target: pointId,
        relation: 'synthesizes',
      });
    });
  }

  return { nodes, edges };
}

// POST /api/graph - Generate knowledge graph nodes and edges
router.post('/', (req, res) => {
  try {
    const { query = 'DewanganWeb Search', sources = [], key_points = [] } = req.body || {};
    const graph = generateGraphData(query, sources, key_points);
    return res.json({
      status: 'ok',
      query,
      nodes: graph.nodes,
      edges: graph.edges,
      links: graph.edges,
    });
  } catch (error) {
    console.error('[Graph] Error generating graph data:', error);
    return res.status(500).json({ error: 'Failed to generate graph' });
  }
});

export default router;
