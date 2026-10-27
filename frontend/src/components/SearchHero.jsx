import { Lock, Zap } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const SUGGESTIONS = [
  'How do vector databases index high-dimensional data?',
  'State of solid-state batteries this year',
  'Compare Rust and Go for high-throughput services',
  'Design a zero-trust architecture for a 50-person startup',
];

export default function SearchHero({ query, setQuery, mode, setMode, onSubmit }) {
  const { isIncognito, toggleIncognito } = useAuth();

  return (
    <div key="hero" className="animate-fade-up w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center px-4 pt-6 select-none">
      {/* Top Pill */}
      <button
        type="button"
        onClick={toggleIncognito}
        title={isIncognito ? "Incognito active (off the record) - click to switch to device vault" : "Click to activate incognito browsing"}
        className={cn(
          "mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-mono tracking-widest uppercase transition-all duration-200 cursor-pointer select-none",
          isIncognito
            ? "border border-purple-500/40 bg-purple-950/60 text-purple-300 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.25)]"
            : "border border-white/10 bg-white/[0.03] text-muted-foreground hover:border-white/20 hover:text-foreground backdrop-blur-md"
        )}
      >
        {isIncognito ? (
          <>
            <span className="text-[13px] leading-none">🕵️</span>
            <span>OFF THE RECORD · INCOGNITO</span>
          </>
        ) : (
          <>
            <Lock className="h-3.5 w-3.5 text-cyan-400" />
            <span>PRIVATE · DEVICE VAULT</span>
          </>
        )}
      </button>

      {/* Main Title */}
      <h1 className="font-display text-6xl sm:text-7xl font-bold tracking-[-0.03em] bg-gradient-to-r from-white via-[#22d3ee] to-[#0ea5e9] bg-clip-text text-transparent">
        DewanganWeb
      </h1>

      {/* Subtitle */}
      <p className="mt-4 max-w-md text-center text-[15px] leading-relaxed text-muted-foreground">
        Private AI search with cited answers, deep research and a live knowledge graph.
      </p>

      {/* Search Input Container with Faint Teal Glow */}
      <div className="relative z-20 mt-8 w-full max-w-3xl">
        <div className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.14),transparent_70%)] blur-2xl" />
        <SearchBar
          value={query}
          onChange={setQuery}
          mode={mode}
          onModeChange={setMode}
          onSubmit={onSubmit}
          autoFocus
          focusShortcut
        />
      </div>

      {/* Suggestion Chips */}
      <div className="mt-6 flex flex-wrap justify-center gap-2.5 max-w-3xl">
        {SUGGESTIONS.map((idea) => (
          <button
            key={idea}
            onClick={() => (onSubmit ? onSubmit(idea, mode) : setQuery(idea))}
            className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[13px] text-muted-foreground transition hover:border-cyan-500/30 hover:bg-white/[0.08] hover:text-foreground"
          >
            {idea}
          </button>
        ))}
      </div>

      {/* Bottom Keyboard Hints */}
      <div className="mt-6 flex items-center justify-center gap-4 text-[11px] font-mono tracking-wider text-muted-foreground/60">
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground">/</kbd> FOCUS
        </span>
        <span className="flex items-center gap-1.5">
          <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-muted-foreground">⌘K</kbd> PALETTE
        </span>
        <span className="flex items-center gap-1 text-muted-foreground/75">
          <Zap className="h-3 w-3 text-cyan-400" /> LIVE WEB
        </span>
      </div>
    </div>
  );
}