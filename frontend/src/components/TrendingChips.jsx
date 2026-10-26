import { ArrowUpRight } from 'lucide-react';
import { TRENDING } from '@/lib/curated';
import { accentOf, getMode } from '@/lib/modes';
import { cn } from '@/lib/utils';

export default function TrendingChips({ limit = 6, onPick }) {
  return (
    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
      {TRENDING.slice(0, limit).map((item, i) => {
        const mode = getMode(item.mode);
        const accent = accentOf(item.mode);
        return (
          <button
            key={item.q}
            onClick={() => onPick(item.q, item.mode)}
            style={{ animationDelay: `${i * 60}ms` }}
            className="group animate-fade-up rounded-2xl glass p-4 text-left transition-all duration-400 ease-silk hover:-translate-y-1 hover:border-white/20 hover:shadow-neon"
          >
            <div className="flex items-center gap-2">
              <span className={cn('h-1.5 w-1.5 rounded-full', accent.dot)} />
              <span className="text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground/80">{item.tag}</span>
              <mode.icon className={cn('ml-auto h-3.5 w-3.5', accent.text)} />
            </div>
            <div className="mt-2.5 text-[13.5px] font-medium leading-snug text-foreground/95">{item.q}</div>
            <div className="mt-3 flex items-center gap-1 text-[11.5px] text-muted-foreground/70 transition-colors group-hover:text-foreground">
              <span>{mode.label}</span>
              <ArrowUpRight className="h-3 w-3" />
            </div>
          </button>
        );
      })}
    </div>
  );
}