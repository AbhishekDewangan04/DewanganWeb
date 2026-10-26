import { Check, Palette, ShieldCheck } from 'lucide-react';
import GlassSwitch from '@/components/GlassSwitch';
import ModePills from '@/components/ModePills';
import { ACCENTS, GLASS_LEVELS, setPrefs, usePrefs } from '@/lib/store';
import { cn } from '@/lib/utils';

export default function Appearance() {
  const prefs = usePrefs();

  return (
    <div className="mx-auto w-full max-w-3xl px-5 pt-12 pb-16">
      <header className="animate-fade-up">
        <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Palette className="h-3 w-3 text-dew-glow1" /> Appearance
        </div>
        <h1 className="mt-6 font-display text-[2.1rem] font-semibold leading-tight tracking-tight sm:text-[2.6rem]">
          Tune the room
        </h1>
        <p className="mt-3 text-[14.5px] text-muted-foreground">
          Accents and glass depth shift instantly across every panel.
        </p>
      </header>

      <section className="mt-8 animate-fade-up rounded-3xl glass hairline-top p-5 sm:p-6">
        <h2 className="font-heading text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Accent glow</h2>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-5">
          {Object.entries(ACCENTS).map(([key, a]) => (
            <button
              key={key}
              onClick={() => setPrefs({ accent: key })}
              className={cn(
                'group relative overflow-hidden rounded-2xl border p-3.5 text-left transition-all duration-300 hover:-translate-y-0.5',
                prefs.accent === key ? 'border-white/25 bg-white/[0.06]' : 'border-white/10 bg-white/[0.02]',
              )}
            >
              <span className={cn('block h-8 w-8 rounded-full', a.swatch)} />
              <span className="mt-3 block text-[12.5px] font-medium text-foreground">{a.label}</span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">{a.hint}</span>
              {prefs.accent === key && <Check className="absolute right-3 top-3 h-3.5 w-3.5 text-dew-glow1" />}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 animate-fade-up rounded-3xl glass p-5 sm:p-6">
        <h2 className="font-heading text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Glass depth</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {Object.entries(GLASS_LEVELS).map(([key, level]) => (
            <button
              key={key}
              onClick={() => setPrefs({ glass: key })}
              className={cn(
                'rounded-full border px-4 py-2 text-xs font-medium transition',
                prefs.glass === key
                  ? 'border-white/25 bg-white/[0.08] text-foreground'
                  : 'border-white/10 bg-white/[0.02] text-muted-foreground hover:text-foreground',
              )}
            >
              {level.label}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-4 animate-fade-up rounded-3xl glass p-5 sm:p-6">
        <h2 className="font-heading text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Default mode</h2>
        <div className="mt-4">
          <ModePills value={prefs.defaultMode} onChange={(id) => setPrefs({ defaultMode: id })} scope="prefs" />
        </div>
      </section>

      <section className="mt-4 flex animate-fade-up flex-col gap-6 rounded-3xl glass p-5 sm:p-6">
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
          <ShieldCheck className="h-4 w-4 shrink-0 text-dew-emerald" />
          DewanganWeb keeps no account, no profile and no server-side search log.
        </div>
      </section>
    </div>
  );
}