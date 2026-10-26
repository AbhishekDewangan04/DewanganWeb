import { cn } from '@/lib/utils';

export default function GlassSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center gap-4">
      <div className="min-w-0 flex-1">
        <div className="text-[13.5px] font-medium text-foreground">{label}</div>
        {description && <p className="mt-1 text-[12.5px] leading-relaxed text-muted-foreground">{description}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full border transition-colors duration-300',
          checked ? 'border-white/20 bg-gradient-to-r from-dew-glow1 to-dew-glow2' : 'border-white/10 bg-white/[0.06]',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 rounded-full bg-white shadow-md transition-transform duration-300 ease-silk',
            checked ? 'translate-x-[22px]' : 'translate-x-0.5',
          )}
          style={{ height: '1.125rem', width: '1.125rem' }}
        />
      </button>
    </div>
  );
}