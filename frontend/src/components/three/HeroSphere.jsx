import { useMemo } from 'react';
import SphereScene from '@/components/three/SphereScene';
import SphereFallback from '@/components/three/SphereFallback';
import useGraphicsMode from '@/lib/useGraphicsMode';
import { usePrefs } from '@/lib/store';

export default function HeroSphere() {
  const prefs = usePrefs();
  const graphics = useGraphicsMode();

  const count = useMemo(() => {
    const cores = navigator.hardwareConcurrency || 4;
    if (cores >= 8) return 3400;
    if (cores >= 5) return 2400;
    return 1500;
  }, []);

  const enabled = graphics === '3d' && prefs.motion !== false;

  // same box either way — the swap costs no layout
  return (
    <div aria-hidden="true" className="absolute inset-0 opacity-90">
      {enabled ? <SphereScene accent={prefs.accent} count={count} /> : <SphereFallback />}
    </div>
  );
}