import { AlertTriangle, RotateCcw, Search } from 'lucide-react';
import AnswerCard from '@/components/AnswerCard';
import SourcesRail from '@/components/SourcesRail';
import StreamingSkeleton from '@/components/StreamingSkeleton';
import KnowledgeGraph from '@/components/graph/KnowledgeGraph';

export default function ResultsView({
  query,
  mode,
  loading,
  error,
  result,
  elapsed,
  saved,
  onToggleSave,
  onRegenerate,
  onFollowUp,
  onNewSearch,
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-5 pb-16 pt-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {loading && <StreamingSkeleton mode={mode} query={query} />}

          {!loading && error && (
            <div className="animate-fade-up overflow-hidden rounded-3xl border border-destructive/30 bg-destructive/[0.06] p-6">
              <div className="flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/15">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                </span>
                <div>
                  <div className="text-sm font-medium text-foreground">That search did not complete</div>
                  <p className="mt-0.5 text-[13px] text-muted-foreground">{error}</p>
                </div>
              </div>
              <button
                onClick={onRegenerate}
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[13px] text-foreground transition hover:bg-white/[0.08]"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Try again
              </button>
            </div>
          )}

          {!loading && !error && result && (
            <AnswerCard
              result={result}
              mode={mode}
              query={query}
              elapsed={elapsed}
              saved={saved}
              onToggleSave={onToggleSave}
              onRegenerate={onRegenerate}
              onFollowUp={onFollowUp}
            />
          )}

          {!loading && !error && result && (
            <div className="mt-6">
              <KnowledgeGraph result={result} query={query} />
            </div>
          )}

          {!loading && !error && !result && (
            <div className="animate-fade-up rounded-3xl glass hairline-top p-10 text-center">
              <Search className="mx-auto h-5 w-5 text-muted-foreground" />
              <div className="mt-4 text-sm text-foreground">Ready when you are</div>
              <p className="mt-1.5 text-[13px] text-muted-foreground">Ask a question above to begin a new search.</p>
              <button
                onClick={onNewSearch}
                className="mt-5 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-[13px] transition hover:bg-white/[0.08]"
              >
                Back to start
              </button>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          {loading && (
            <div className="space-y-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl glass p-3.5">
                  <div className="shimmer h-2.5 w-24 rounded-full" />
                  <div className="shimmer mt-2.5 h-2.5 w-full rounded-full" />
                  <div className="shimmer mt-2 h-2.5 w-2/3 rounded-full" />
                </div>
              ))}
            </div>
          )}
          {!loading && result && <SourcesRail sources={result.sources} mode={mode} />}
        </aside>
      </div>
    </div>
  );
}