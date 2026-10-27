import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import SphereScene from '@/components/three/SphereScene';
import SphereFallback from '@/components/three/SphereFallback';
import useGraphicsMode from '@/lib/useGraphicsMode';
import { usePrefs } from '@/lib/store';

export default function HeroSphere() {
  const prefs = usePrefs();
  const graphics = useGraphicsMode();
  const location = useLocation();
  const isHome = location.pathname === '/' && !location.search;

  const count = useMemo(() => {
    const cores = navigator.hardwareConcurrency || 4;
    if (cores >= 8) return 3400;
    if (cores >= 5) return 2400;
    return 1500;
  }, []);

  const enabled = graphics === '3d' && prefs.motion !== false;

  // same box either way — the swap costs no layout
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 flex items-center justify-center origin-center transition-all duration-700 ${
        isHome ? 'opacity-70 scale-[1.2]' : 'opacity-40 scale-100'
      }`}
    >
      {enabled ? <SphereScene accent={prefs.accent} count={count} /> : <SphereFallback />}
    </div>
  );
}