import { useSyncExternalStore } from 'react';

/**
 * Transient, in-memory search state shared with the WebGL scene.
 * Phases: idle | thinking | answering
 */
let phase = 'idle';
let timer = null;
const listeners = new Set();

function emit() {
  listeners.forEach((fn) => fn());
}

export function getSearchPhase() {
  return phase;
}

export function subscribeSearchPhase(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function setSearchPhase(next, autoIdleMs = 0) {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (phase !== next) {
    phase = next;
    emit();
  }
  if (autoIdleMs > 0) {
    timer = setTimeout(() => {
      timer = null;
      phase = 'idle';
      emit();
    }, autoIdleMs);
  }
}

export function useSearchPhase() {
  return useSyncExternalStore(subscribeSearchPhase, getSearchPhase, getSearchPhase);
}