import { ShieldCheck, Layers, Zap } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import ModePills from '@/components/ModePills';
import TrendingChips from '@/components/TrendingChips';
import { PROMPT_IDEAS } from '@/lib/curated';

const PILLARS = [
  { icon: Zap, title: 'Answers, not links', body: 'Every query is read, cross-checked and written up in seconds.' },
  { icon: Layers, title: 'Five modes', body: 'From a quick fact to a deep briefing, academic review or build sheet.' },
  { icon: ShieldCheck, title: 'Private by default', body: 'Your searches live on this device. Nothing is shared or sold.' },
];

export default function SearchHero({ query, setQuery, mode, setMode, onSubmit }) {
  return (
    <div key="hero" className="animate-fade-up mx-auto w-full max-w-3xl px-5 pt-16 sm:pt-24">
      <div className="text-center">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-dew-glow1" />
          Private search engine
        </div>
        <h1 className="font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Dewangan<span className="text-gradient">Web</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Ask anything. DewanganWeb reads the live web, weighs the sources and hands you a written answer with the
          receipts attached.
        </p>
      </div>

      <div className="mt-10">
        <SearchBar
          value={query}
          onChange={setQuery}
          mode={mode}
          onModeChange={setMode}
          onSubmit={onSubmit}
          autoFocus
          focusShortcut
        />
        <div className="mt-4 flex justify-center">
          <ModePills value={mode} onChange={setMode} scope="hero" />
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {PROMPT_IDEAS.map((idea) => (
          <button
            key={idea}
            onClick={() => setQuery(idea)}
            className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-1.5 text-[12px] text-muted-foreground transition hover:border-white/25 hover:text-foreground"
          >
            {idea}
          </button>
        ))}
      </div>

      <section className="mt-16">
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-heading text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Trending questions
          </h2>
          <span className="text-[11px] text-muted-foreground/60">Curated starting points</span>
        </div>
        <TrendingChips onPick={onSubmit} />
      </section>

      <section className="mt-14 grid gap-3 pb-8 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
            <p.icon className="h-4 w-4 text-dew-glow1" />
            <div className="mt-3 text-[13.5px] font-medium text-foreground">{p.title}</div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">{p.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}