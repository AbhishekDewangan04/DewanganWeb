import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Compass, Clock, Palette, ArrowRight } from 'lucide-react';
import { useHistory } from '@/lib/store';
import { getMode } from '@/lib/modes';
import { cn } from '@/lib/utils';

const PAGES = [
  { label: 'Search workspace', to: '/', icon: Search, hint: 'New question' },
  { label: 'Discover', to: '/discover', icon: Compass, hint: 'Curated starting points' },
  { label: 'History', to: '/history', icon: Clock, hint: 'Past answers' },
  { label: 'Appearance', to: '/appearance', icon: Palette, hint: 'Accent & glass' },
];

export default function CommandPalette({ open, onClose }) {
  const navigate = useNavigate();
  const history = useHistory();
  const [term, setTerm] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);

  const items = useMemo(() => {
    const t = term.trim().toLowerCase();
    const pages = PAGES.filter((p) => p.label.toLowerCase().includes(t)).map((p) => ({ ...p, kind: 'page' }));
    const recents = history
      .filter((h) => h.query.toLowerCase().includes(t))
      .slice(0, 5)
      .map((h) => ({ label: h.query, kind: 'recent', mode: h.mode, icon: getMode(h.mode).icon }));
    return [...pages, ...recents];
  }, [term, history]);

  useEffect(() => {
    if (open) {
      setTerm('');
      setIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [open]);

  useEffect(() => setIndex(0), [term]);

  useEffect(() => {
    if (!open) return;
    const onEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [open, onClose]);

  const go = (item) => {
    if (!item) return;
    if (item.kind === 'page') navigate(item.to);
    else navigate(`/?q=${encodeURIComponent(item.label)}&mode=${item.mode}`);
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(items[index]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Quick actions"
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl bg-[#06121b] border border-cyan-400/30 shadow-[0_0_60px_-10px_rgba(6,182,212,0.35),0_30px_80px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              <Search className="h-4 w-4 text-cyan-400 shrink-0" />
              <input
                ref={inputRef}
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Jump to a page or re-run a search…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60 text-foreground"
              />
              <kbd className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">esc</kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2 scroll-none">
              {items.length === 0 && (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">Nothing matched that.</div>
              )}
              {items.map((item, i) => {
                const isFirstOfKind = i === 0 || item.kind !== items[i - 1]?.kind;
                const isSelected = i === index;
                return (
                  <div key={`${item.kind}-${item.label}-${i}`}>
                    {isFirstOfKind && (
                      <div className="px-3 pt-3 pb-1.5 font-mono text-[10.5px] uppercase tracking-widest text-muted-foreground/60 select-none">
                        {item.kind === 'page' ? 'Pages' : 'Recent searches'}
                      </div>
                    )}
                    <button
                      onMouseEnter={() => setIndex(i)}
                      onClick={() => go(item)}
                      className={cn(
                        'group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm transition-all duration-150 cursor-pointer overflow-hidden',
                        isSelected ? 'bg-cyan-950/40 text-foreground' : 'text-muted-foreground hover:bg-white/[0.04] hover:text-foreground',
                      )}
                    >
                      {isSelected && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                      )}
                      <item.icon className={cn('h-4 w-4 shrink-0 transition-colors', isSelected ? 'text-cyan-400' : 'text-muted-foreground')} />
                      <span className="min-w-0 flex-1 truncate">{item.label}</span>
                      {item.kind === 'recent' ? (
                        <span className="shrink-0 text-[10.5px] uppercase tracking-wider text-muted-foreground/70">
                          {getMode(item.mode).label}
                        </span>
                      ) : (
                        <span className="flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground/70">
                          {item.hint}
                          <ArrowRight className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 text-[11px] text-muted-foreground/70">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">↵</kbd>
                <span>to open</span>
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">↑</kbd>
                <kbd className="rounded-md border border-white/10 bg-white/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">↓</kbd>
                <span>to move</span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}