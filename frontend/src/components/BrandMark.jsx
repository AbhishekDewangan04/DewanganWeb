import { cn } from '@/lib/utils';

export default function BrandMark({ className, showWord = true }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn('relative grid h-10 w-10 shrink-0 place-items-center rounded-2xl glass-2 hairline-top', className)}>
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_30%_20%,hsl(var(--glow-1)/0.5),transparent_70%)] opacity-80" />
        <span className="relative font-display text-[17px] font-bold tracking-tight text-foreground">D</span>
      </div>
      {showWord && (
        <div className="min-w-0">
          <div className="font-display text-[15px] font-semibold leading-none tracking-tight">
            Dewangan<span className="text-gradient">Web</span>
          </div>
          <div className="mt-1 text-[10.5px] uppercase tracking-[0.22em] text-muted-foreground/70">Private search</div>
        </div>
      )}
    </div>
  );
}