import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const MODES = {
  web: {
    label: 'Web',
    guide:
      'Answer directly and quickly. Lead with a 2-3 sentence bottom line, then the supporting detail as short headed sections or bullets. Keep it tight: 250-400 words.',
    sources: '4 to 6',
  },
  research: {
    label: 'Deep Research',
    guide:
      'Write a structured briefing. Sections in this order: "Bottom line", "What is happening", "Why it matters", "What to watch". Be thorough and comparative: 500-800 words. Surface disagreements between sources explicitly.',
    sources: '6 to 8',
  },
  academic: {
    label: 'Academic',
    guide:
      'Use an evidence-first register. Sections: "Consensus", "Evidence and methods", "Open questions", "Caveats". Prefer peer-reviewed and preprint sources, name study designs and sample limitations, and never overstate certainty: 400-650 words.',
    sources: '5 to 7',
  },
  code: {
    label: 'Code',
    guide:
      'Be implementation-focused and correct. Give the working approach first, then a short fenced code block with the actual snippet (language-tagged), then gotchas and trade-offs. Reference official documentation where possible: 300-500 words.',
    sources: '4 to 6',
  },
  media: {
    label: 'Media',
    guide:
      'Summarise the visual and reported coverage: "What the coverage shows", "Notable pieces", "Where accounts differ". Point at video, documentary, photography and press sources by name: 350-550 words.',
    sources: '5 to 8',
  },
};

const ANSWER_SCHEMA = {
  type: 'object',
  properties: {
    answer: {
      type: 'string',
      description:
        'Markdown answer. Use short headings and bullet lists. Cite sources inline as [1], [2] matching the sources array. Never use tables.',
    },
    key_points: {
      type: 'array',
      description: 'Three to four very short takeaways, each under 90 characters.',
      items: { type: 'string' },
    },
    sources: {
      type: 'array',
      description: 'Real sources found in the search context, in citation order.',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          url: { type: 'string', description: 'Absolute https URL taken from the search results. Never invent one.' },
          snippet: { type: 'string', description: 'One sentence on what this source contributes.' },
        },
        required: ['title', 'url'],
      },
    },
    follow_ups: {
      type: 'array',
      description: 'Three to five natural next questions, written as the user would type them.',
      items: { type: 'string' },
    },
    confidence: { type: 'string', description: 'One of: high, moderate, low — plus a few words on why.' },
  },
  required: ['answer', 'key_points', 'sources', 'follow_ups'],
};

export default async function (req) {
  const base44 = createClientFromRequest(req);
  try {
    const body = await req.json().catch(() => ({}));
    const query = typeof body.query === 'string' ? body.query.trim().slice(0, 400) : '';
    if (query.length < 2) {
      return Response.json({ error: 'Please enter a question of at least two characters.' }, { status: 400 });
    }

    const mode = MODES[body.mode] ? body.mode : 'web';
    const config = MODES[mode];
    const started = Date.now();

    const prompt = `You are DewanganWeb, a precise private search engine. A user asked:

"${query}"

Search mode: ${config.label}.
${config.guide}

Grounding rules:
- Use only facts you can support from the live search context. If something is uncertain or the sources disagree, say so plainly instead of guessing.
- Cite every substantive claim inline with bracketed numbers like [1] that match the sources array exactly.
- The sources array must contain ${config.sources} real results with the exact https URLs from the search context. Never fabricate, shorten or guess a URL. If fewer real results exist, return fewer.
- Write in clean markdown. No tables, no "as an AI" framing, no restating the question back.
- key_points are scannable takeaways, each under 90 characters.
- follow_ups are the questions a sharp researcher would ask next.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: ANSWER_SCHEMA,
    });

    return Response.json({
      query,
      mode,
      answer: result?.answer || '',
      key_points: Array.isArray(result?.key_points) ? result.key_points.slice(0, 4) : [],
      sources: Array.isArray(result?.sources)
        ? result.sources
            .filter((s) => s && typeof s.url === 'string' && /^https?:\/\//.test(s.url))
            .slice(0, 8)
        : [],
      follow_ups: Array.isArray(result?.follow_ups) ? result.follow_ups.slice(0, 5) : [],
      confidence: result?.confidence || '',
      elapsed_ms: Date.now() - started,
    });
  } catch (error) {
    return Response.json({ error: error.message || 'The search service is unavailable right now.' }, { status: 500 });
  }
}