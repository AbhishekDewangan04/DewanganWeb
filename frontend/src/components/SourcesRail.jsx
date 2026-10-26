import { ExternalLink } from 'lucide-react';
import { Image } from '@/components/ui/image';
import { accentOf } from '@/lib/modes';
import { cn } from '@/lib/utils';

function domainOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'source';
  }
}

export default function SourcesRail({ sources = [], mode }) {
  const accent = accentOf(mode);
  if (!sources.length) return null;

  return (
    <section className="animate-fade-up">
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="font-heading text-[13px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Sources
        </h2>
        <span className="text-[11px] text-muted-foreground/70">{sources.length} links</span>
      </div>
      <ol className="flex flex-col gap-2.5">
        {sources.map((source, i) => {
          const domain = domainOf(source.url);
          return (
            <li key={`${source.url}-${i}`}>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer noopener"
                className="group block rounded-2xl glass p-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:shadow-neon"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05] text-[11px] font-semibold',
                      accent.text,
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Image
                        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
                        alt=""
                        className="h-3.5 w-3.5 shrink-0 rounded-sm opacity-80"
                        fittingType="fill"
                      />
                      <span className="truncate text-[11px] text-muted-foreground/80">{domain}</span>
                      <ExternalLink className="ml-auto h-3 w-3 shrink-0 text-muted-foreground/50 transition group-hover:text-foreground" />
                    </div>
                    <div className="mt-1.5 line-clamp-2 text-[13px] font-medium leading-snug text-foreground/95">
                      {source.title}
                    </div>
                    {source.snippet && (
                      <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-muted-foreground">
                        {source.snippet}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}