import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, Clock, Search, Trash2 } from 'lucide-react';
import { clearHistory, removeHistory, toggleSaved, useHistory } from '@/lib/store';
import { accentOf, getMode } from '@/lib/modes';
import { cn } from '@/lib/utils';

export default function History() {
  const history = useHistory();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const [term, setTerm] = useState('');
  const [confirming, setConfirming] = useState(false);

  const rows = useMemo(() => {
    const t = term.trim().toLowerCase();
    return history.filter((h) => (filter === 'saved' ? h.saved : true)).filter((h) => h.query.toLowerCase().includes(t));
  }, [history, filter, term]);

  const open = (h) => navigate(`/?q=${encodeURIComponent(h.query)}&mode=${h.mode}`);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 pt-12 pb-16">
      <header className="animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Clock className="h-3 w-3 text-dew-glow1" /> History
        </div>
        <h1 className="mt-6 font-display text-[2.1rem] font-semibold leading-tight tracking-tight sm:text-[2.6rem]">
          Your research trail
        </h1>
        <p className="mt-3 text-[14.5px] text-muted-foreground">
          Kept only in this browser. Clear it any time — nothing leaves your device.
        </p>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full glass p-1">
          {[
            { id: 'all', label: 'All searches' },
            { id: 'saved', label: 'Saved' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-medium transition-colors',
                filter === tab.id ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-full glass px-3.5 py-2">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Filter your searches…"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60"
          />
        </div>

        {history.length > 0 && (
          <button
            onClick={() => (confirming ? (clearHistory(), setConfirming(false)) : setConfirming(true))}
            onBlur={() => setConfirming(false)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs transition',
              confirming
                ? 'border-destructive/50 bg-destructive/10 text-destructive'
                : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground',
            )}
          >
            {confirming ? 'Tap to confirm' : 'Clear all'}
          </button>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-2.5">
        {rows.length === 0 && (
          <div className="animate-fade-up rounded-3xl glass hairline-top p-10 text-center">
            <div className="text-sm text-foreground">Nothing here yet</div>
            <p className="mt-1.5 text-[13px] text-muted-foreground">
              {history.length === 0 ? 'Your searches will appear here as you go.' : 'No search matches that filter.'}
            </p>
          </div>
        )}

        {rows.map((row, i) => {
          const mode = getMode(row.mode);
          const accent = accentOf(row.mode);
          return (
            <div
              key={row.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="group animate-fade-up flex items-center gap-3 rounded-2xl glass p-4 transition-all duration-300 hover:border-white/20"
            >
              <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', accent.soft)}>
                <mode.icon className={cn('h-4 w-4', accent.text)} />
              </span>
              <button onClick={() => open(row)} className="min-w-0 flex-1 text-left">
                <div className="truncate text-[13.5px] font-medium text-foreground/95">{row.query}</div>
                <div className="mt-0.5 flex items-center gap-2 text-[11.5px] text-muted-foreground/70">
                  <span>{mode.label}</span>
                  <span>·</span>
                  <span>{row.created_date ? formatDistanceToNow(new Date(row.created_date), { addSuffix: true }) : 'just now'}</span>
                  {row.sources?.length > 0 && (
                    <>
                      <span>·</span>
                      <span>{row.sources.length} sources</span>
                    </>
                  )}
                </div>
              </button>
              <button
                onClick={() => toggleSaved(row.id)}
                aria-label="Save search"
                className={cn(
                  'grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 transition',
                  row.saved ? 'bg-white/[0.1] text-dew-glow1' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Bookmark className={cn('h-3.5 w-3.5', row.saved && 'fill-current')} />
              </button>
              <button
                onClick={() => removeHistory(row.id)}
                aria-label="Remove from history"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 text-muted-foreground opacity-0 transition hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}