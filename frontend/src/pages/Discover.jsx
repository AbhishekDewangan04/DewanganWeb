import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Loader2, Sparkles, Wand2 } from 'lucide-react';
import AnswerCard from '@/components/AnswerCard';
import { base44 } from '@/api/base44Client';
import { COLLECTIONS } from '@/lib/curated';
import { ACCENT, getMode } from '@/lib/modes';
import { addToHistory, uid } from '@/lib/store';
import { cn } from '@/lib/utils';

const BRIEFING_QUERY = 'What are the most important developments across AI, compute and product in the last 24 hours?';

export default function Discover() {
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const open = (q, mode) => navigate(`/?q=${encodeURIComponent(q)}&mode=${mode}`);

  const runBriefing = async () => {
    setLoading(true);
    setError(null);
    const started = Date.now();
    try {
      const res = await base44.functions.invoke('aiSearch', { query: BRIEFING_QUERY, mode: 'research' });
      const data = res?.data;
      if (!data || data.error) throw new Error(data?.error || 'The briefing did not complete.');
      setBriefing({ data, elapsed: Date.now() - started });
      addToHistory({
        id: uid(),
        query: BRIEFING_QUERY,
        mode: 'research',
        answer: data.answer,
        sources: data.sources,
        created_date: new Date().toISOString(),
        elapsed_ms: Date.now() - started,
      });
    } catch (e) {
      setError(e?.message || 'The briefing did not complete.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 pt-12 pb-16">
      <header className="animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Sparkles className="h-3 w-3 text-dew-glow1" /> Discover
        </div>
        <h1 className="mt-6 font-display text-[2.1rem] font-semibold leading-tight tracking-tight sm:text-[2.6rem]">
          Where a good question can start
        </h1>
        <p className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-muted-foreground">
          Curated research tracks, plus a live briefing built from today's sources whenever you want one.
        </p>
      </header>

      <section className="mt-8 animate-fade-up rounded-3xl glass hairline-top p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="font-heading text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Daily briefing
            </div>
            <p className="mt-2 text-[13.5px] text-foreground/90">{BRIEFING_QUERY}</p>
          </div>
          <button
            onClick={runBriefing}
            disabled={loading}
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-dew-glow1 to-dew-glow2 px-5 py-2.5 text-[13px] font-medium text-dew-ink transition-transform duration-300 hover:scale-[1.03] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
            {loading ? 'Reading the web…' : 'Run today’s briefing'}
          </button>
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/[0.06] p-4 text-[13px] text-muted-foreground">
          {error}
        </div>
      )}

      {briefing && (
        <div className="mt-6">
          <AnswerCard
            result={briefing.data}
            mode="research"
            query={BRIEFING_QUERY}
            elapsed={briefing.elapsed}
            saved={false}
            onToggleSave={() => {}}
            onRegenerate={runBriefing}
            onFollowUp={(q) => open(q, 'research')}
            busy={loading}
          />
        </div>
      )}

      <section className="mt-14 grid gap-4 sm:grid-cols-2">
        {COLLECTIONS.map((collection, ci) => {
          const accent = ACCENT[collection.accent] || ACCENT.cyan;
          return (
            <div
              key={collection.title}
              style={{ animationDelay: `${ci * 70}ms` }}
              className="animate-fade-up rounded-3xl glass p-5 transition-all duration-400 ease-silk hover:-translate-y-1 hover:border-white/20"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn('h-2 w-2 rounded-full', accent.dot)} />
                <h2 className="font-heading text-[15px] font-semibold tracking-tight">{collection.title}</h2>
              </div>
              <p className="mt-1.5 text-[12.5px] text-muted-foreground">{collection.subtitle}</p>
              <ul className="mt-4 flex flex-col gap-1">
                {collection.items.map((item) => {
                  const mode = getMode(item.mode);
                  return (
                    <li key={item.q}>
                      <button
                        onClick={() => open(item.q, item.mode)}
                        className="group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]"
                      >
                        <mode.icon className={cn('h-3.5 w-3.5 shrink-0', accent.text)} />
                        <span className="min-w-0 flex-1 truncate text-[13px] text-foreground/90">{item.q}</span>
                        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50 transition group-hover:text-foreground" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </section>
    </div>
  );
}