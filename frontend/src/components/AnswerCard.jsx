import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bookmark, Check, Copy, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { accentOf, getMode } from '@/lib/modes';
import { cn } from '@/lib/utils';

export default function AnswerCard({ result, mode, query, elapsed, saved, onToggleSave, onRegenerate, onFollowUp, busy }) {
  const [copied, setCopied] = useState(false);
  const accent = accentOf(mode);
  const activeMode = getMode(mode);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(result.answer || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article className="animate-fade-up overflow-hidden rounded-3xl glass hairline-top">
      <header className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4 sm:px-7">
        <span className={cn('grid h-8 w-8 place-items-center rounded-xl', accent.soft)}>
          <Sparkles className={cn('h-4 w-4', accent.text)} />
        </span>
        <div className="min-w-0 flex-1">
          <div className={cn('text-[11px] uppercase tracking-[0.18em]', accent.text)}>{activeMode.label} answer</div>
          <div className="truncate text-sm text-muted-foreground">{query}</div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="mr-1 hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] text-muted-foreground sm:flex">
            <Zap className="h-3 w-3 text-dew-glow1" />
            {result.sources?.length || 0} sources
            {elapsed ? ` · ${(elapsed / 1000).toFixed(1)}s` : ''}
          </span>
          <button
            onClick={onToggleSave}
            title={saved ? 'Remove from saved' : 'Save answer'}
            aria-label="Save answer"
            className={cn(
              'grid h-8 w-8 place-items-center rounded-xl border border-white/10 transition',
              saved ? 'bg-white/[0.1] text-dew-glow1' : 'bg-white/[0.03] text-muted-foreground hover:text-foreground',
            )}
          >
            <Bookmark className={cn('h-3.5 w-3.5', saved && 'fill-current')} />
          </button>
          <button
            onClick={copy}
            title="Copy answer"
            aria-label="Copy answer"
            className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-dew-emerald" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onRegenerate}
            disabled={busy}
            title="Re-run this query"
            aria-label="Re-run this query"
            className="grid h-8 w-8 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-muted-foreground transition hover:text-foreground disabled:opacity-40"
          >
            <RefreshCw className={cn('h-3.5 w-3.5', busy && 'animate-spin')} />
          </button>
        </div>
      </header>

      <div className="px-5 py-6 sm:px-7">
        {result.key_points?.length > 0 && (
          <div className="mb-6 grid gap-2.5 sm:grid-cols-2">
            {result.key_points.slice(0, 4).map((point, i) => (
              <div
                key={i}
                className="animate-fade-up rounded-2xl border border-white/10 bg-white/[0.025] p-3.5 text-[13px] leading-snug text-foreground/90"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                {point}
              </div>
            ))}
          </div>
        )}

        <div className="md-body">
          <ReactMarkdown>{result.answer || ''}</ReactMarkdown>
        </div>

        {result.follow_ups?.length > 0 && (
          <div className="mt-8 border-t border-white/10 pt-5">
            <div className="mb-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Keep digging</div>
            <div className="flex flex-wrap gap-2">
              {result.follow_ups.slice(0, 5).map((q, i) => (
                <button
                  key={i}
                  onClick={() => onFollowUp(q)}
                  className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-left text-[12.5px] text-foreground/90 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/[0.07]"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}