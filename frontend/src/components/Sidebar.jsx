import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Compass, Clock, Palette, Command, PanelLeftClose, PanelLeftOpen, ShieldCheck } from 'lucide-react';
import BrandMark from '@/components/BrandMark';
import { ACCENTS, setPrefs, usePrefs } from '@/lib/store';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Search', icon: Search, end: true },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/appearance', label: 'Appearance', icon: Palette },
];

export default function Sidebar({ collapsed, onToggle, onOpenPalette }) {
  const prefs = usePrefs();

  return (
    <aside
      className={cn(
        'fixed left-4 top-4 z-40 hidden h-[calc(100vh-2rem)] flex-col rounded-3xl glass-2 hairline-top p-3 shadow-glass transition-[width] duration-500 ease-silk lg:flex',
        collapsed ? 'w-[76px]' : 'w-[268px]',
      )}
    >
      <div className={cn('flex items-center px-1 pt-1', collapsed ? 'justify-center' : 'justify-between')}>
        <BrandMark showWord={!collapsed} />
        {!collapsed && (
          <button
            onClick={onToggle}
            aria-label="Collapse sidebar"
            className="grid h-8 w-8 place-items-center rounded-xl text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          onClick={onToggle}
          aria-label="Expand sidebar"
          className="mx-auto mt-3 grid h-8 w-8 place-items-center rounded-xl text-muted-foreground transition hover:bg-white/[0.06] hover:text-foreground"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </button>
      )}

      <nav className="mt-7 flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            title={item.label}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                collapsed && 'justify-center px-0',
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="nav-active"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-2xl border border-white/10 bg-white/[0.07] shadow-[0_10px_40px_-20px_hsl(var(--glow-1)/0.9)]"
                  />
                )}
                <item.icon className={cn('relative h-[18px] w-[18px] transition-colors', isActive && 'text-dew-glow1')} />
                {!collapsed && <span className="relative">{item.label}</span>}
                {!collapsed && isActive && <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-dew-glow1" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <button
          onClick={onOpenPalette}
          className="mt-5 flex w-full items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-left text-xs text-muted-foreground transition hover:border-white/20 hover:text-foreground"
        >
          <Command className="h-3.5 w-3.5" />
          <span>Quick actions</span>
          <kbd className="ml-auto rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </button>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <div className={cn('rounded-2xl border border-white/10 bg-white/[0.03] p-3', collapsed && 'px-1.5 py-2')}>
          {!collapsed && (
            <div className="mb-2 text-[10.5px] uppercase tracking-[0.18em] text-muted-foreground/70">Accent</div>
          )}
          <div className={cn('flex items-center gap-2', collapsed && 'flex-col')}>
            {Object.entries(ACCENTS).map(([key, a]) => (
              <button
                key={key}
                title={a.label}
                aria-label={`${a.label} accent`}
                onClick={() => setPrefs({ accent: key })}
                className={cn(
                  'h-5 w-5 rounded-full transition-transform duration-300 hover:scale-110',
                  a.swatch,
                  prefs.accent === key ? 'ring-2 ring-white/60 ring-offset-2 ring-offset-dew-ink' : 'opacity-60',
                )}
              />
            ))}
          </div>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-2 px-1 text-[11px] text-muted-foreground/70">
            <ShieldCheck className="h-3.5 w-3.5 text-dew-emerald" />
            <span>History stays on this device</span>
          </div>
        )}
      </div>
    </aside>
  );
}