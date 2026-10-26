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
  const [collapsed, setCollapsed] = useState(false);

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
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} onOpenPalette={() => setPaletteOpen(true)} />
      <main className={`min-h-screen pb-28 lg:pb-10 lg:pl-[300px] transition-[padding] duration-500 ease-silk ${collapsed ? 'lg:pl-[108px]' : ''}`}>
        <Outlet />
      </main>
      <MobileNav onOpenPalette={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  );
}