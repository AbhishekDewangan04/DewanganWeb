import { NavLink } from 'react-router-dom';
import { Search, Compass, Clock, Palette, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Search', icon: Search, end: true },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/appearance', label: 'Appearance', icon: Palette },
];

export default function Sidebar({ onOpenPalette }) {
  return (
    <aside className="fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col items-center gap-3 select-none">
      {/* DW Logo Tile */}
      <NavLink
        to="/"
        title="DewanganWeb"
        aria-label="DewanganWeb Home"
        className="group relative flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-glass backdrop-blur-xl transition-all duration-200 hover:border-cyan-500/40 hover:scale-105 active:scale-95"
      >
        <span className="font-display text-sm font-black tracking-tight">
          <span className="text-white">D</span>
          <span className="text-cyan-400">W</span>
        </span>
        <span className="pointer-events-none absolute left-full ml-3 hidden items-center whitespace-nowrap rounded-lg border border-white/10 bg-[#07131d]/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xl backdrop-blur-md group-hover:flex z-50">
          DewanganWeb
        </span>
      </NavLink>

      {/* Vertical Pill Rail */}
      <div className="flex flex-col items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] p-1.5 shadow-glass backdrop-blur-xl">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            aria-label={item.label}
            className={({ isActive }) =>
              cn(
                'group relative flex h-10 w-10 items-center justify-center rounded-2xl transition-all duration-200',
                isActive
                  ? 'border border-cyan-400/80 bg-cyan-950/40 text-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.45)]'
                  : 'text-muted-foreground hover:bg-white/[0.06] hover:text-foreground'
              )
            }
          >
            <item.icon className="h-[18px] w-[18px]" />
            <span className="pointer-events-none absolute left-full ml-3 hidden items-center whitespace-nowrap rounded-lg border border-white/10 bg-[#07131d]/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xl backdrop-blur-md group-hover:flex z-50">
              {item.label}
            </span>
          </NavLink>
        ))}

        {/* Divider */}
        <div className="my-1 h-px w-5 bg-white/10" />

        {/* Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenPalette}
          title="Command Palette (⌘K)"
          aria-label="Command Palette"
          className="group relative flex h-10 w-10 items-center justify-center rounded-2xl text-muted-foreground transition-all duration-200 hover:bg-white/[0.06] hover:text-foreground active:scale-95"
        >
          <Command className="h-[18px] w-[18px]" />
          <span className="pointer-events-none absolute left-full ml-3 hidden items-center whitespace-nowrap rounded-lg border border-white/10 bg-[#07131d]/95 px-2.5 py-1 text-xs font-medium text-foreground shadow-2xl backdrop-blur-md group-hover:flex z-50">
            Command Palette <kbd className="ml-1.5 font-mono text-[10px] text-muted-foreground">⌘K</kbd>
          </span>
        </button>
      </div>
    </aside>
  );
}