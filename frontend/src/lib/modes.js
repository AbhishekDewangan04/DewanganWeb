import { Globe, Layers, GraduationCap, Code2, Clapperboard } from 'lucide-react';

export const MODES = [
  {
    id: 'web',
    label: 'Web',
    icon: Globe,
    accent: 'cyan',
    blurb: 'Fast answers grounded in live sources.',
    placeholder: 'Ask anything…',
    hint: 'Open web, straight to the point',
  },
  {
    id: 'research',
    label: 'Deep Research',
    icon: Layers,
    accent: 'indigo',
    blurb: 'Wide scan, structured long-form briefing.',
    placeholder: 'Map out a topic end to end…',
    hint: 'Broad scan, layered synthesis',
  },
  {
    id: 'academic',
    label: 'Academic',
    icon: GraduationCap,
    accent: 'emerald',
    blurb: 'Evidence first — methods, findings, limits.',
    placeholder: 'What does the literature say about…',
    hint: 'Papers, methods, caveats',
  },
  {
    id: 'code',
    label: 'Code',
    icon: Code2,
    accent: 'violet',
    blurb: 'Implementation detail and working snippets.',
    placeholder: 'How do I implement…',
    hint: 'Docs, repos, runnable code',
  },
  {
    id: 'media',
    label: 'Media',
    icon: Clapperboard,
    accent: 'amber',
    blurb: 'Visual sources, video and reporting.',
    placeholder: 'Show me coverage of…',
    hint: 'Video, imagery, press',
  },
];

export function getMode(id) {
  return MODES.find((m) => m.id === id) || MODES[0];
}

export const ACCENT = {
  cyan: {
    text: 'text-dew-cyan',
    dot: 'bg-dew-cyan',
    soft: 'bg-dew-cyan/10',
    border: 'border-dew-cyan/35',
    ring: 'ring-dew-cyan/40',
    glow: 'shadow-[0_0_70px_-18px_hsl(var(--dew-cyan)/0.65)]',
  },
  indigo: {
    text: 'text-dew-indigo',
    dot: 'bg-dew-indigo',
    soft: 'bg-dew-indigo/10',
    border: 'border-dew-indigo/35',
    ring: 'ring-dew-indigo/40',
    glow: 'shadow-[0_0_70px_-18px_hsl(var(--dew-indigo)/0.65)]',
  },
  emerald: {
    text: 'text-dew-emerald',
    dot: 'bg-dew-emerald',
    soft: 'bg-dew-emerald/10',
    border: 'border-dew-emerald/35',
    ring: 'ring-dew-emerald/40',
    glow: 'shadow-[0_0_70px_-18px_hsl(var(--dew-emerald)/0.65)]',
  },
  violet: {
    text: 'text-dew-violet',
    dot: 'bg-dew-violet',
    soft: 'bg-dew-violet/10',
    border: 'border-dew-violet/35',
    ring: 'ring-dew-violet/40',
    glow: 'shadow-[0_0_70px_-18px_hsl(var(--dew-violet)/0.65)]',
  },
  amber: {
    text: 'text-dew-amber',
    dot: 'bg-dew-amber',
    soft: 'bg-dew-amber/10',
    border: 'border-dew-amber/35',
    ring: 'ring-dew-amber/40',
    glow: 'shadow-[0_0_70px_-18px_hsl(var(--dew-amber)/0.65)]',
  },
};

export function accentOf(modeId) {
  return ACCENT[getMode(modeId).accent] || ACCENT.cyan;
}