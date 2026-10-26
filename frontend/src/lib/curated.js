export const TRENDING = [
  { q: 'What changed in AI reasoning models this quarter?', mode: 'web', tag: 'Frontier' },
  { q: 'How do vector databases power retrieval at scale?', mode: 'code', tag: 'Engineering' },
  { q: 'Evidence on sleep and long-term cognition', mode: 'academic', tag: 'Health' },
  { q: 'State of the energy transition: 2026 outlook', mode: 'research', tag: 'Climate' },
  { q: 'Best practices for shipping React apps today', mode: 'code', tag: 'Frontend' },
  { q: 'Independent coverage of the AI chip market', mode: 'media', tag: 'Markets' },
];

export const COLLECTIONS = [
  {
    title: 'Signal Desk',
    subtitle: 'Five-minute scans across the frontier.',
    accent: 'cyan',
    items: [
      { q: 'Most consequential AI research releases this month', mode: 'research' },
      { q: 'Where agentic coding tools actually help teams', mode: 'code' },
      { q: 'Compute costs per useful token, explained', mode: 'web' },
      { q: 'What regulators changed in the last 90 days', mode: 'web' },
    ],
  },
  {
    title: 'Research Bench',
    subtitle: 'Evidence-led reading for deep work.',
    accent: 'emerald',
    items: [
      { q: 'Randomised trials on focused work and interruptions', mode: 'academic' },
      { q: 'Meta-analyses on habit formation', mode: 'academic' },
      { q: 'How retrieval-augmented systems are evaluated', mode: 'academic' },
      { q: 'Longitudinal studies on remote team performance', mode: 'academic' },
    ],
  },
  {
    title: 'Build Room',
    subtitle: 'Ship-ready technical digests.',
    accent: 'violet',
    items: [
      { q: 'Postgres full-text search versus a dedicated index', mode: 'code' },
      { q: 'Streaming responses from an LLM without a framework', mode: 'code' },
      { q: 'Designing a glassmorphic design system in Tailwind', mode: 'code' },
      { q: 'Evaluating vector index latency in production', mode: 'code' },
    ],
  },
  {
    title: 'Watch List',
    subtitle: 'Reporting and visuals worth your time.',
    accent: 'amber',
    items: [
      { q: 'Documentary coverage of the semiconductor supply chain', mode: 'media' },
      { q: 'Best explainer videos on transformer architectures', mode: 'media' },
      { q: 'Photojournalism from this year’s climate summit', mode: 'media' },
      { q: 'Conference talks on multimodal interfaces', mode: 'media' },
    ],
  },
];

export const PROMPT_IDEAS = [
  'Compare two options and tell me which wins',
  'Give me a 30-day plan with milestones',
  'Explain it to me like I am new to the field',
  'Find the strongest counter-argument',
];