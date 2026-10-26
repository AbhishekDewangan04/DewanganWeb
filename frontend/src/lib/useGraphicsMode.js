import { useEffect, useState } from 'react';

export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl')));
  } catch {
    return false;
  }
}

/**
 * '3d' when the device can afford a live WebGL scene, otherwise 'static'.
 * 'pending' until we know — callers should show their lightweight fallback.
 */
export default function useGraphicsMode() {
  const [mode, setMode] = useState('pending');

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    const cores = navigator.hardwareConcurrency || 4;
    const memory = navigator.deviceMemory || 4;
    const lowPower = cores <= 3 || memory <= 2 || (window.innerWidth < 640 && cores < 6);
    setMode(!supportsWebGL() || reduced || lowPower ? 'static' : '3d');
  }, []);

  return mode;
}