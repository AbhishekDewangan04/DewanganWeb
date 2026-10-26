import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { accentOf, getMode } from '@/lib/modes';
import { cn } from '@/lib/utils';

const STAGES = [
  'Scanning live sources…',
  'Cross-checking claims…',
  'Ranking by relevance…',
  'Composing the answer…',
];

export default function StreamingSkeleton({ mode, query }) {
  const [stage, setStage] = useState(0);
  const accent = accentOf(mode);
  const activeMode = getMode(mode);

  useEffect(() => {
    const timer = setInterval(() => setStage((s) => (s + 1) % STAGES.length), 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="animate-fade-up overflow-hidden rounded-3xl glass hairline-top p-5 sm:p-7">
      <div className="flex items-center gap-2.5">
        <span className={cn('grid h-8 w-8 place-items-center rounded-xl', accent.soft)}>
          <Sparkles className={cn('h-4 w-4 animate-pulse', accent.text)} />
        </span>
        <div className="min-w-0">
          <div className={cn('text-[11px] uppercase tracking-[0.18em]', accent.text)}>{activeMode.label} mode</div>
          <div className="truncate text-sm text-muted-foreground">{query}</div>
        </div>
      </div>

      <div className="mt-5 h-1 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full w-1/3 animate-pulseglow rounded-full bg-gradient-to-r from-dew-glow1 to-dew-glow2" />
      </div>
      <div className="mt-2.5 text-xs text-muted-foreground">{STAGES[stage]}</div>

      <div className="mt-6 space-y-3">
        <div className="shimmer h-3.5 w-[92%] rounded-full" />
        <div className="shimmer h-3.5 w-[78%] rounded-full" />
        <div className="shimmer h-3.5 w-[85%] rounded-full" />
        <div className="shimmer h-3.5 w-[64%] rounded-full" />
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-white/10 bg-white/[0.02] p-3.5">
            <div className="shimmer h-2.5 w-24 rounded-full" />
            <div className="shimmer mt-2.5 h-2.5 w-full rounded-full" />
            <div className="shimmer mt-2 h-2.5 w-3/5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}