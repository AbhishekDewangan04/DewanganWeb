import { motion } from 'framer-motion';
import { MODES } from '@/lib/modes';
import { cn } from '@/lib/utils';

export default function ModePills({ value, onChange, scope = 'hero', className }) {
  return (
    <div className={cn('scroll-none -mx-1 flex items-center gap-1 overflow-x-auto px-1 py-1', className)}>
      <div className="flex items-center gap-1 rounded-full glass p-1">
        {MODES.map((m) => {
          const active = value === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              title={m.blurb}
              className={cn(
                'relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-300',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground/85',
              )}
            >
              {active && (
                <motion.span
                  layoutId={`mode-pill-${scope}`}
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.08]"
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <m.icon className={cn('h-3.5 w-3.5', active && 'text-dew-glow1')} />
                {m.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}