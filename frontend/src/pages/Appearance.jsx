import { Check, Palette, ShieldCheck } from 'lucide-react';
import GlassSwitch from '@/components/GlassSwitch';
import { MODES } from '@/lib/modes';
import { ACCENTS, GLASS_LEVELS, setPrefs, usePrefs } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const ACCENT_STYLES = {
  cyan: {
    selected: 'border-cyan-400 bg-cyan-950/30 shadow-[0_0_20px_rgba(6,182,212,0.35)]',
    check: 'text-cyan-400',
    swatchGlow: 'shadow-[0_0_14px_rgba(6,182,212,0.6)]',
  },
  indigo: {
    selected: 'border-indigo-400 bg-indigo-950/30 shadow-[0_0_20px_rgba(99,102,241,0.35)]',
    check: 'text-indigo-400',
    swatchGlow: 'shadow-[0_0_14px_rgba(99,102,241,0.6)]',
  },
  emerald: {
    selected: 'border-emerald-400 bg-emerald-950/30 shadow-[0_0_20px_rgba(52,211,153,0.35)]',
    check: 'text-emerald-400',
    swatchGlow: 'shadow-[0_0_14px_rgba(52,211,153,0.6)]',
  },
  violet: {
    selected: 'border-violet-400 bg-violet-950/30 shadow-[0_0_20px_rgba(167,139,250,0.35)]',
    check: 'text-violet-400',
    swatchGlow: 'shadow-[0_0_14px_rgba(167,139,250,0.6)]',
  },
  amber: {
    selected: 'border-amber-400 bg-amber-950/30 shadow-[0_0_20px_rgba(251,191,36,0.35)]',
    check: 'text-amber-400',
    swatchGlow: 'shadow-[0_0_14px_rgba(251,191,36,0.6)]',
  },
};

export default function Appearance() {
  const prefs = usePrefs();
  const { isIncognito, toggleIncognito } = useAuth();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-16">
      <header className="animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur-md">
          <Palette className="h-3.5 w-3.5 text-cyan-400" />
          <span>APPEARANCE</span>
        </div>
        <h1 className="mt-5 font-display text-4xl sm:text-5xl font-bold tracking-[-0.03em] bg-gradient-to-r from-white via-[#22d3ee] to-[#0ea5e9] bg-clip-text text-transparent">
          Tune the room
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Accents and glass depth shift instantly across every panel.
        </p>
      </header>

      <section className="mt-8 animate-fade-up rounded-3xl glass p-5 sm:p-6">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Accent glow</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-5">
          {Object.entries(ACCENTS).map(([key, a]) => {
            const isSelected = prefs.accent === key;
            const style = ACCENT_STYLES[key] || ACCENT_STYLES.cyan;
            return (
              <button
                key={key}
                onClick={() => setPrefs({ accent: key })}
                className={cn(
                  'group relative overflow-hidden rounded-2xl p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5 cursor-pointer select-none',
                  isSelected
                    ? cn('border bg-white/[0.04]', style.selected)
                    : 'glass hover:border-cyan-400/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]',
                )}
              >
                <span className={cn('block h-8 w-8 rounded-full transition-shadow duration-300', a.swatch, style.swatchGlow)} />
                <span className="mt-3 block text-[12.5px] font-medium text-foreground">{a.label}</span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{a.hint}</span>
                {isSelected && <Check className={cn('absolute right-3 top-3 h-3.5 w-3.5', style.check)} />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4 animate-fade-up rounded-3xl glass p-5 sm:p-6">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Glass depth</h2>
        <div className="mt-4 inline-flex flex-wrap items-center gap-1 rounded-full glass p-1">
          {Object.entries(GLASS_LEVELS).map(([key, level]) => {
            const active = prefs.glass === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setPrefs({ glass: key })}
                className={cn(
                  'rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 select-none cursor-pointer',
                  active
                    ? 'border border-cyan-400/80 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                    : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
                )}
              >
                {level.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4 animate-fade-up rounded-3xl glass p-5 sm:p-6">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Default mode</h2>
        <div className="mt-4 inline-flex flex-wrap items-center gap-1 rounded-full glass p-1">
          {MODES.map((m) => {
            const active = prefs.defaultMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setPrefs({ defaultMode: m.id })}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 select-none cursor-pointer',
                  active
                    ? 'border border-cyan-400/80 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                    : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground',
                )}
              >
                <m.icon className="h-3.5 w-3.5" />
                {m.label}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-4 flex animate-fade-up flex-col gap-6 rounded-3xl glass p-5 sm:p-6">
        <GlassSwitch
          label="Browse Privately (Incognito Session)"
          description="Prevent searches from being stored in your local device vault or browser history."
          checked={isIncognito}
          onChange={toggleIncognito}
        />
        <div className="h-px bg-white/10" />
        <GlassSwitch
          label="Ambient motion"
          description="Drifting aurora, shimmer skeletons and micro-transitions."
          checked={prefs.motion}
          onChange={(v) => setPrefs({ motion: v })}
        />
        <div className="h-px bg-white/10" />
        <GlassSwitch
          label="Keep search history"
          description="Stored in this browser only, so you can re-run past answers."
          checked={prefs.saveHistory}
          onChange={(v) => setPrefs({ saveHistory: v })}
        />
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.02] p-3.5 text-[12px] text-muted-foreground">
          <ShieldCheck className={cn("h-4 w-4 shrink-0", isIncognito ? "text-dew-violet" : "text-dew-emerald")} />
          {isIncognito
            ? "🕵️ Incognito session active — searches, answers, and queries will not be saved."
            : "DewanganWeb keeps no account, no profile and no server-side search log."}
        </div>
      </section>
    </div>
  );
}