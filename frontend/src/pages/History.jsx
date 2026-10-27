import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, Clock, Search, Trash2 } from 'lucide-react';
import { clearHistory, removeHistory, toggleSaved, useHistory } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { accentOf, getMode } from '@/lib/modes';
import { cn } from '@/lib/utils';

export default function History() {
  const history = useHistory();
  const navigate = useNavigate();
  const { isIncognito, toggleIncognito } = useAuth();
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
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
          <Clock className="h-3.5 w-3.5 text-cyan-400" />
          <span>HISTORY</span>
        </div>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-[-0.03em] bg-gradient-to-r from-white via-[#22d3ee] to-[#0ea5e9] bg-clip-text text-transparent">
          Your research trail
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Kept only in this browser. Clear it any time — nothing leaves your device.
        </p>

        {isIncognito && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dew-violet/40 bg-dew-violet/10 px-4 py-3 text-dew-violet shadow-[0_0_20px_rgba(168,85,247,0.2)]">
            <div className="flex items-center gap-2.5 text-xs font-medium">
              <span className="text-base">🕵️</span>
              <span>Browse Privately (Incognito Active) — New searches will not be recorded in this browser or saved to device vault.</span>
            </div>
            <button
              onClick={toggleIncognito}
              className="rounded-full border border-dew-violet/40 bg-dew-violet/20 px-3 py-1 text-[11px] font-semibold text-dew-violet transition hover:bg-dew-violet/30 cursor-pointer"
            >
              Turn Off
            </button>
          </div>
        )}
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
                'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 select-none cursor-pointer',
                filter === tab.id
                  ? 'border border-cyan-400/80 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                  : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex min-w-[200px] flex-1 items-center gap-2 rounded-full glass px-4 py-2 transition-all focus-within:border-cyan-400/60 focus-within:shadow-[0_0_20px_rgba(6,182,212,0.25)] focus-within:ring-1 focus-within:ring-cyan-400/40">
          <Search className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Filter your searches…"
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-muted-foreground/60 text-foreground"
          />
        </div>

        {history.length > 0 && (
          <button
            onClick={() => (confirming ? (clearHistory(), setConfirming(false)) : setConfirming(true))}
            onBlur={() => setConfirming(false)}
            className={cn(
              'rounded-full border px-4 py-2 text-xs font-medium transition-all duration-200 cursor-pointer select-none',
              confirming
                ? 'border-destructive/60 bg-destructive/15 text-destructive shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                : 'border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground',
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
              className="group animate-fade-up flex items-center gap-3 rounded-2xl glass p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-400/50 hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.35)]"
            >
              <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl shadow-[0_0_14px_-2px_currentColor]', accent.soft, accent.text)}>
                <mode.icon className="h-4 w-4" />
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
                  'grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.06] backdrop-blur-md transition hover:border-white/20 hover:bg-white/[0.1] cursor-pointer',
                  row.saved ? 'text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Bookmark className={cn('h-3.5 w-3.5', row.saved && 'fill-cyan-400')} />
              </button>
              <button
                onClick={() => removeHistory(row.id)}
                aria-label="Remove from history"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-muted-foreground opacity-0 transition-all duration-200 hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 cursor-pointer"
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