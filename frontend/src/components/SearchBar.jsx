import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ArrowUp, ChevronDown, Clock, CornerDownLeft, Loader2, Search, Sparkles, TrendingUp, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MODES, getMode } from '@/lib/modes';
import { TRENDING } from '@/lib/curated';
import { useHistory } from '@/lib/store';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const suggestionCache = new Map();

export default function SearchBar({
  value,
  onChange,
  mode,
  onModeChange,
  onSubmit,
  variant = 'hero',
  autoFocus = false,
  focusShortcut = false,
}) {
  const history = useHistory();
  const { isIncognito, toggleIncognito } = useAuth();
  const [focused, setFocused] = useState(false);
  const [modeOpen, setModeOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const activeMode = getMode(mode);
  const compact = variant === 'compact';

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (!focusShortcut) return;
    const onKey = (e) => {
      const el = document.activeElement;
      const typing = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [focusShortcut]);

  useEffect(() => {
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setFocused(false);
        setModeOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (q.length < 6) {
      setAiSuggestions([]);
      setAiLoading(false);
      return;
    }
    const key = `${mode}:${q.toLowerCase()}`;
    if (suggestionCache.has(key)) {
      setAiSuggestions(suggestionCache.get(key));
      setAiLoading(false);
      return;
    }
    setAiLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await base44.functions.invoke('querySuggestions', { partial: q, mode });
        const list = Array.isArray(res?.data?.suggestions) ? res.data.suggestions.slice(0, 5) : [];
        suggestionCache.set(key, list);
        setAiSuggestions(list);
      } catch {
        setAiSuggestions([]);
      } finally {
        setAiLoading(false);
      }
    }, 520);
    return () => clearTimeout(timer);
  }, [value, mode]);

  const rows = useMemo(() => {
    const q = value.trim().toLowerCase();
    const out = [];
    history
      .filter((h) => (q ? h.query.toLowerCase().includes(q) : true))
      .slice(0, q ? 4 : 3)
      .forEach((h) => out.push({ kind: 'recent', icon: Clock, label: h.query, meta: getMode(h.mode).label, value: h.query }));
    TRENDING.filter((t) => (q ? t.q.toLowerCase().includes(q) : true))
      .slice(0, q ? 3 : 3)
      .forEach((t) => out.push({ kind: 'trending', icon: TrendingUp, label: t.q, meta: t.tag, value: t.q }));
    aiSuggestions.forEach((s) => out.push({ kind: 'ai', icon: Sparkles, label: s, meta: 'Suggested', value: s }));
    return out.slice(0, 9);
  }, [value, history, aiSuggestions]);

  const submit = (text) => {
    const finalText = (text ?? value).trim();
    if (!finalText) return;
    onChange(finalText);
    setFocused(false);
    setActiveIndex(-1);
    onSubmit?.(finalText, mode);
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocused(true);
      setActiveIndex((i) => Math.min(i + 1, rows.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      submit(activeIndex >= 0 ? rows[activeIndex].value : value);
    } else if (e.key === 'Escape') {
      setFocused(false);
      setModeOpen(false);
    }
  };

  const showPanel = focused && rows.length > 0;

  return (
    <div ref={wrapRef} className={cn('relative w-full', (modeOpen || focused) && 'z-50')}>
      {compact ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className={cn(
            'gradient-ring group relative rounded-[26px] p-px transition-shadow duration-500',
            focused ? 'glow-strong' : 'glow-soft',
          )}
        >
          <div className="relative flex items-center gap-2 rounded-[25px] glass-2 pl-2 pr-2 py-2">
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setModeOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-foreground/90 transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <activeMode.icon className="h-3.5 w-3.5 text-dew-glow1" />
                <span className="hidden sm:inline">{activeMode.label}</span>
                <ChevronDown className={cn('h-3 w-3 transition-transform', modeOpen && 'rotate-180')} />
              </button>
              <AnimatePresence>
                {modeOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute top-full left-0 mt-2 z-50 w-72 overflow-hidden rounded-2xl glass-2 p-1.5 shadow-glass shadow-2xl backdrop-blur-xl border border-white/15"
                  >
                    {MODES.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onModeChange(m.id);
                          setModeOpen(false);
                        }}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
                          m.id === mode ? 'bg-white/[0.08]' : 'hover:bg-white/[0.05]',
                        )}
                      >
                        <m.icon className={cn('mt-0.5 h-4 w-4 shrink-0', m.id === mode ? 'text-dew-glow1' : 'text-muted-foreground')} />
                        <span className="min-w-0">
                          <span className="block text-[13px] font-medium text-foreground">{m.label}</span>
                          <span className="block text-[11.5px] leading-snug text-muted-foreground">{m.blurb}</span>
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Search className="ml-1 hidden h-4 w-4 shrink-0 text-muted-foreground/70 sm:block" />

            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setActiveIndex(-1);
              }}
              onFocus={() => setFocused(true)}
              onKeyDown={onKeyDown}
              placeholder={activeMode.placeholder}
              aria-label="Search DewanganWeb"
              className="min-w-0 flex-1 bg-transparent py-1.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground/60"
            />

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {isIncognito && (
              <button
                type="button"
                onClick={toggleIncognito}
                title="Off the Record (Incognito Session) - click to toggle"
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/60 text-purple-300 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0 cursor-pointer select-none font-mono tracking-wide px-2 py-0.5 text-[10.5px]"
              >
                <span className="text-[12px] leading-none">🕵️</span>
                <span className="font-medium">Off the Record</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></span>
              </button>
            )}

            <button
              type="submit"
              aria-label="Search"
              className="group/btn relative grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-dew-glow1 to-dew-glow2 text-dew-ink transition-transform duration-300 hover:scale-105 active:scale-95"
            >
              <ArrowRight className="h-[18px] w-[18px] transition-transform duration-300 group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        </form>
      ) : (
        /* HERO VARIANT: ONE rounded-[28px] glass card with cyan border glow */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className={cn(
            'group relative rounded-[28px] border border-cyan-400/40 bg-[#0f3a4a]/30 p-4 backdrop-blur-xl transition-all duration-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_35px_-5px_rgba(6,182,212,0.25)]',
            focused && 'border-cyan-400/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_0_40px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/30'
          )}
        >
          {/* Row 1: sparkle icon (cyan), input, small ⌘K chip, circular send button */}
          <div className="flex items-center gap-3 px-1">
            <Sparkles className="h-5 w-5 text-cyan-400 shrink-0" />

            <input
              ref={inputRef}
              value={value}
              onChange={(e) => {
                onChange(e.target.value);
                setActiveIndex(-1);
              }}
              onFocus={() => setFocused(true)}
              onKeyDown={onKeyDown}
              placeholder="Ask anything, or paste a link to research..."
              aria-label="Search DewanganWeb"
              className="min-w-0 flex-1 bg-transparent py-1 text-[16px] text-foreground outline-none placeholder:text-muted-foreground/60"
            />

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  inputRef.current?.focus();
                }}
                aria-label="Clear"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {isIncognito && (
              <button
                type="button"
                onClick={toggleIncognito}
                title="Off the Record (Incognito Session) - click to toggle"
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-950/60 text-purple-300 backdrop-blur-md shadow-[0_0_15px_rgba(168,85,247,0.25)] shrink-0 cursor-pointer select-none font-mono tracking-wide px-2.5 py-1 text-[11px]"
              >
                <span className="text-[12px] leading-none">🕵️</span>
                <span className="font-medium">Off the Record</span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></span>
              </button>
            )}

            <kbd className="hidden sm:inline-flex items-center justify-center rounded-lg border border-white/10 bg-white/[0.08] px-2 py-1 font-mono text-[11px] text-muted-foreground/80 shrink-0 select-none">
              ⌘K
            </kbd>

            <button
              type="submit"
              aria-label="Search"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 bg-white/[0.08] text-muted-foreground transition hover:border-white/20 hover:bg-white/[0.12] hover:text-foreground active:scale-95"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>

          {/* Thin divider */}
          <div className="my-3.5 h-px w-full bg-white/10" />

          {/* Row 2: 5 mode pills inline on left, active mode's hint right-aligned */}
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              {MODES.map((m) => {
                const isActive = m.id === mode;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onModeChange?.(m.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 select-none',
                      isActive
                        ? 'border border-cyan-400/80 bg-cyan-950/40 text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                        : 'text-muted-foreground hover:bg-white/[0.05] hover:text-foreground'
                    )}
                  >
                    <m.icon className="h-3.5 w-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <span className="hidden sm:inline text-xs text-muted-foreground/60 shrink-0 font-normal">
              {activeMode?.id === 'web' ? 'Broad, current synthesis' : activeMode?.hint}
            </span>
          </div>
        </form>
      )}

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#06121b]/95 border border-cyan-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl p-4 overflow-hidden"
          >
            <div className="mb-1 flex items-center justify-between px-3 pt-1.5 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/70">
              <span>{value.trim() ? 'Matches' : 'Start from here'}</span>
              {aiLoading && (
                <span className="flex items-center gap-1.5 normal-case tracking-normal">
                  <Loader2 className="h-3 w-3 animate-spin" /> thinking
                </span>
              )}
            </div>
            <div className="max-h-[46vh] overflow-y-auto scroll-none">
              {rows.map((row, i) => (
                <button
                  key={`${row.kind}-${row.value}-${i}`}
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => submit(row.value)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-colors',
                    i === activeIndex ? 'bg-white/[0.07] text-foreground' : 'text-muted-foreground',
                  )}
                >
                  <row.icon className={cn('h-3.5 w-3.5 shrink-0', row.kind === 'ai' && 'text-dew-glow1')} />
                  <span className="min-w-0 flex-1 truncate">{row.label}</span>
                  <span className="shrink-0 text-[10.5px] uppercase tracking-wider text-muted-foreground/60">{row.meta}</span>
                  {i === activeIndex && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}