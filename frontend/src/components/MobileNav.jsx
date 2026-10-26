import { NavLink } from 'react-router-dom';
import { Search, Compass, Clock, Palette, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV = [
  { to: '/', label: 'Search', icon: Search, end: true },
  { to: '/discover', label: 'Discover', icon: Compass },
  { to: '/history', label: 'History', icon: Clock },
  { to: '/appearance', label: 'Theme', icon: Palette },
];

export default function MobileNav({ onOpenPalette }) {
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 lg:hidden">
      <div className="flex items-center gap-1 rounded-full glass-2 hairline-top p-1.5 shadow-glass">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium transition-colors',
                isActive ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground',
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden xs:inline">{item.label}</span>
          </NavLink>
        ))}
        <button
          onClick={onOpenPalette}
          aria-label="Quick actions"
          className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition hover:text-foreground"
        >
          <Command className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}