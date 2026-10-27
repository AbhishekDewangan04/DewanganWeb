import { useEffect, useState } from 'react';

const KEY = 'dewanganweb.store.v1';

const DEFAULTS = {
  prefs: {
    accent: 'cyan',
    glass: 'medium',
    motion: true,
    saveHistory: true,
    defaultMode: 'web',
  },
  history: [],
};

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { prefs: { ...DEFAULTS.prefs }, history: [] };
    const parsed = JSON.parse(raw) || {};
    return {
      prefs: { ...DEFAULTS.prefs, ...(parsed.prefs || {}) },
      history: Array.isArray(parsed.history) ? parsed.history : [],
    };
  } catch {
    return { prefs: { ...DEFAULTS.prefs }, history: [] };
  }
}

function write(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* quota — history simply stops growing */
  }
  window.dispatchEvent(new Event('dew:store'));
}

function update(fn) {
  const next = fn(read());
  write(next);
  return next;
}

export function getState() {
  return read();
}

export function uid() {
  return globalThis.crypto?.randomUUID?.() || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function useStore() {
  const [state, setState] = useState(read);
  useEffect(() => {
    const sync = () => setState(read());
    window.addEventListener('dew:store', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('dew:store', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return state;
}

export const ACCENTS = {
  cyan: { label: 'Cyan', hint: 'Cold signal', glow1: '188 86% 53%', glow2: '239 84% 67%', swatch: 'bg-dew-cyan' },
  indigo: { label: 'Electric Indigo', hint: 'Deep focus', glow1: '239 84% 67%', glow2: '258 90% 76%', swatch: 'bg-dew-indigo' },
  emerald: { label: 'Emerald', hint: 'Calm research', glow1: '158 64% 52%', glow2: '188 86% 53%', swatch: 'bg-dew-emerald' },
  violet: { label: 'Violet', hint: 'Studio mode', glow1: '258 90% 76%', glow2: '239 84% 67%', swatch: 'bg-dew-violet' },
  amber: { label: 'Amber', hint: 'Warm archive', glow1: '38 92% 60%', glow2: '12 90% 62%', swatch: 'bg-dew-amber' },
};

export const GLASS_LEVELS = {
  subtle: { label: 'Subtle', alpha: '0.028' },
  medium: { label: 'Balanced', alpha: '0.048' },
  vivid: { label: 'Vivid', alpha: '0.08' },
};

export function applyTheme(prefs) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const accent = ACCENTS[prefs?.accent] || ACCENTS.cyan;
  const glass = GLASS_LEVELS[prefs?.glass] || GLASS_LEVELS.medium;
  root.style.setProperty('--glow-1', accent.glow1);
  root.style.setProperty('--glow-2', accent.glow2);
  root.style.setProperty('--glass-alpha', glass.alpha);
  root.classList.toggle('reduce-motion', prefs?.motion === false);
}

export function usePrefs() {
  return useStore().prefs;
}

export function setPrefs(patch) {
  return update((s) => ({ ...s, prefs: { ...s.prefs, ...patch } }));
}

export function useHistory() {
  return useStore().history;
}

export function addToHistory(entry) {
  const state = read();
  const isIncognito = (typeof window !== 'undefined' && window.sessionStorage.getItem('dew_incognito') === 'true') || Boolean(entry?.incognito);
  if (!state.prefs.saveHistory || isIncognito) return;
  const trimmed = {
    ...entry,
    answer: (entry.answer || '').slice(0, 6000),
    sources: (entry.sources || []).slice(0, 12),
  };
  const rest = state.history.filter((h) => !(h.query === entry.query && h.mode === entry.mode));
  write({ ...state, history: [trimmed, ...rest].slice(0, 40) });
}

export function toggleSaved(id) {
  return update((s) => ({
    ...s,
    history: s.history.map((h) => (h.id === id ? { ...h, saved: !h.saved } : h)),
  }));
}

export function removeHistory(id) {
  return update((s) => ({ ...s, history: s.history.filter((h) => h.id !== id) }));
}

export function clearHistory() {
  return update((s) => ({ ...s, history: [] }));
}

export function isSaved(query, mode) {
  return read().history.some((h) => h.query === query && h.mode === mode && h.saved);
}

export function findSavedId(query, mode) {
  return read().history.find((h) => h.query === query && h.mode === mode)?.id || null;
}