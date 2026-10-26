import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Clock, CornerDownLeft, Loader2, Search, Sparkles, TrendingUp, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { MODES, getMode } from '@/lib/modes';
import { TRENDING } from '@/lib/curated';
import { useHistory } from '@/lib/store';
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
    <div ref={wrapRef} className="relative w-full">
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
        <div className={cn('relative flex items-center gap-2 rounded-[25px] glass-2', compact ? 'pl-2 pr-2 py-2' : 'pl-2.5 pr-2.5 py-2.5')}>
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setModeOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-xs font-medium text-foreground/90 transition hover:border-white/20 hover:bg-white/[0.08]"
            >
              <activeMode.icon className="h-3.5 w-3.5 text-dew-glow1" />
              <span className={cn(compact && 'hidden sm:inline')}>{activeMode.label}</span>
              <ChevronDown className={cn('h-3 w-3 transition-transform', modeOpen && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {modeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute left-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-2xl glass-2 p-1.5 shadow-glass"
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
            className={cn(
              'min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground/60',
              compact ? 'py-1.5 text-[15px]' : 'py-2 text-[16px] sm:text-[17px]',
            )}
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

          {!compact && !value && (
            <div className="hidden items-center gap-1.5 pr-1 text-[11px] text-muted-foreground/70 lg:flex">
              <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono">/</kbd>
              <span>focus</span>
            </div>
          )}

          <button
            type="submit"
            aria-label="Search"
            className={cn(
              'group/btn relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-dew-glow1 to-dew-glow2 text-dew-ink transition-transform duration-300 hover:scale-105 active:scale-95',
              compact ? 'h-9 w-9' : 'h-11 w-11',
            )}
          >
            <ArrowRight className={cn('h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5', compact && 'h-[18px] w-[18px]')} />
          </button>
        </div>
      </form>

      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-x-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-3xl glass-2 hairline-top p-2 shadow-glass"
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