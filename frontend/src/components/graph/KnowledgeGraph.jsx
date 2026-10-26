import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Focus, Maximize2, Minimize2, Network, RotateCcw } from 'lucide-react';
import GraphCanvas from '@/components/graph/GraphCanvas';
import { buildGraph, neighborsOf } from '@/components/graph/buildGraph';
import { usePrefs } from '@/lib/store';
import { cn } from '@/lib/utils';

function hslVar(name, fallback) {
  if (typeof document === 'undefined') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return `hsl(${(raw || fallback).split(/\s+/).join(', ')})`;
}

function truncate(text, max = 34) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default function KnowledgeGraph({ result, query }) {
  const prefs = usePrefs();

  const [open, setOpen] = useState(false);
  const [tall, setTall] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [isolate, setIsolate] = useState(false);

  const graph = useMemo(() => buildGraph(result, query), [result, query]);

  const colors = useMemo(
    () => ({
      query: hslVar('--glow-1', '188 86% 53%'),
      topic: hslVar('--glow-2', '239 84% 67%'),
      thread: hslVar('--dew-emerald', '158 64% 52%'),
      source: 'hsl(210, 30%, 92%)',
      edge: 'hsl(0, 0%, 100%)',
    }),
    [prefs.accent],
  );

  const allowedIds = useMemo(
    () => (isolate && selectedId ? neighborsOf(graph, selectedId) : null),
    [isolate, selectedId, graph],
  );

  const activeId = selectedId || hoveredId;
  const detail = graph.nodes.find((node) => node.id === activeId) || null;

  const select = (id) => setSelectedId((current) => (current === id ? null : id));
  const reset = () => {
    setSelectedId(null);
    setIsolate(false);
  };

  if (graph.nodes.length < 3) return null;

  return (
    <article className="animate-fade-up overflow-hidden rounded-3xl glass hairline-top">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-dew-glow1/10">
          <Network className="h-4 w-4 text-dew-glow1" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-[0.18em] text-dew-glow1">Knowledge graph</div>
          <div className="truncate text-sm text-muted-foreground">
            {graph.nodes.length} nodes · {graph.links.length} links · drag to orbit
          </div>
        </div>

        {open && (
          <>
            <button
              onClick={() => setIsolate((v) => !v)}
              disabled={!selectedId}
              title="Isolate the selected node"
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] transition disabled:opacity-40',
                isolate && selectedId
                  ? 'border-dew-glow1/40 bg-dew-glow1/10 text-dew-glow1'
                  : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground',
              )}
            >
              <Focus className="h-3.5 w-3.5" /> Isolate
            </button>
            <button
              onClick={reset}
              title="Reset selection"
              aria-label="Reset selection"
              className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </>
        )}

        <button
          onClick={() => setOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[12px] text-foreground transition hover:bg-white/[0.07]"
        >
          {open ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          {open ? 'Collapse' : 'Open graph'}
        </button>
      </header>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="graph-body"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="border-b border-white/10"
          >
            <div className={cn('relative w-full', tall ? 'h-[520px]' : 'h-[340px]')}>
              <GraphCanvas
                graph={graph}
                colors={colors}
                selectedId={selectedId}
                hoveredId={hoveredId}
                onSelect={select}
                onHover={setHoveredId}
                allowedIds={allowedIds}
                animate={prefs.motion !== false}
              />

              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_45%,transparent,hsl(var(--background)/0.55))]" />

              <button
                onClick={() => setTall((v) => !v)}
                aria-label={tall ? 'Shrink graph' : 'Expand graph'}
                className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-background/60 text-muted-foreground backdrop-blur transition hover:text-foreground"
              >
                {tall ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
            </div>

            {detail && (
              <div className="flex items-start gap-3 border-t border-white/10 px-5 py-3 sm:px-7">
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{detail.detail}</div>
                  <div className="mt-0.5 text-[13px] leading-snug text-foreground">{detail.label}</div>
                </div>
                {detail.url && (
                  <a
                    href={detail.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12px] text-foreground transition hover:bg-white/[0.07]"
                  >
                    Open source <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 px-5 pb-5 pt-4 sm:px-7">
              {graph.nodes
                .filter((node) => node.kind !== 'query')
                .map((node) => (
                  <button
                    key={node.id}
                    onClick={() => select(node.id)}
                    title={node.label}
                    className={cn(
                      'max-w-full truncate rounded-full border px-2.5 py-1 text-[11px] transition',
                      selectedId === node.id
                        ? 'border-dew-glow1/40 bg-dew-glow1/10 text-dew-glow1'
                        : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {truncate(node.label)}
                  </button>
                ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}