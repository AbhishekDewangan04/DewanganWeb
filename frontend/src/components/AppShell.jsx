import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import AmbientBackground from '@/components/AmbientBackground';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import CommandPalette from '@/components/CommandPalette';
import { applyTheme, usePrefs } from '@/lib/store';

export default function AppShell() {
  const prefs = usePrefs();
  const [paletteOpen, setPaletteOpen] = useState(false);

  useEffect(() => {
    applyTheme(prefs);
  }, [prefs.accent, prefs.glass, prefs.motion]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <Sidebar onOpenPalette={() => setPaletteOpen(true)} />
      <main className="min-h-screen w-full pb-28 lg:pb-10">
        <Outlet />
      </main>
      <MobileNav onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}