import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import SearchHero from '@/components/SearchHero';
import ResultsView from '@/components/ResultsView';
import { base44 } from '@/api/base44Client';
import { addToHistory, findSavedId, getState, toggleSaved, usePrefs, uid } from '@/lib/store';
import { getMode } from '@/lib/modes';
import { setSearchPhase } from '@/lib/searchSignal';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const prefs = usePrefs();

  const queryParam = searchParams.get('q') || '';
  const modeParam = searchParams.get('mode');

  const [query, setQuery] = useState(queryParam);
  const [mode, setMode] = useState(modeParam || prefs.defaultMode || 'web');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [elapsed, setElapsed] = useState(null);
  const [saved, setSaved] = useState(false);
  const lastRun = useRef('');

  useEffect(() => {
    if (modeParam && modeParam !== mode) setMode(modeParam);
  }, [modeParam]);

  const runSearch = useCallback(async (q, m) => {
    const started = Date.now();
    setLoading(true);
    setSearchPhase('thinking');
    setError(null);
    setResult(null);
    setElapsed(null);
    try {
      const res = await base44.functions.invoke('aiSearch', { query: q, mode: m });
      const data = res?.data;
      if (!data || data.error) throw new Error(data?.error || 'The search service did not respond.');
      setResult(data);
      setSearchPhase('answering', 2400);
      setElapsed(Date.now() - started);
      setSaved(Boolean(getState().history.find((h) => h.query === q && h.mode === m)?.saved));
      addToHistory({
        id: uid(),
        query: q,
        mode: m,
        answer: data.answer,
        sources: data.sources,
        created_date: new Date().toISOString(),
        elapsed_ms: Date.now() - started,
      });
    } catch (e) {
      setError(e?.message || 'Something went wrong while searching.');
      setSearchPhase('idle');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const key = `${queryParam}|${mode}`;
    if (!queryParam) {
      lastRun.current = '';
      setResult(null);
      setError(null);
      setLoading(false);
      setQuery('');
      return;
    }
    if (lastRun.current === key) return;
    lastRun.current = key;
    setQuery(queryParam);
    runSearch(queryParam, mode);
  }, [queryParam, mode]);

  const submit = (q, m) => {
    const target = getMode(m || mode).id;
    if (m && m !== mode) setMode(target);
    setQuery(q);
    lastRun.current = `${q}|${target}`;
    setSearchParams(q ? { q, mode: target } : { mode: target });
    if (!q) return;
    runSearch(q, target);
  };

  const changeMode = (m) => {
    setMode(m);
    if (queryParam) setSearchParams({ q: queryParam, mode: m });
  };

  const onToggleSave = () => {
    const id = findSavedId(queryParam, mode);
    if (id) {
      toggleSaved(id);
      setSaved((v) => !v);
    }
  };

  const newSearch = () => {
    setSearchParams({});
    setQuery('');
    setResult(null);
    setError(null);
  };

  const activeQuery = queryParam || query;
  const showResults = Boolean(queryParam);

  return (
    <div>
      {showResults && (
        <div className="sticky top-0 z-30 border-b border-white/10 bg-background/60 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center gap-3 px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <SearchBar
                value={query}
                onChange={setQuery}
                mode={mode}
                onModeChange={changeMode}
                onSubmit={(q, m) => submit(q, m)}
                variant="compact"
                focusShortcut
              />
            </div>
            <button
              onClick={newSearch}
              title="New search"
              aria-label="New search"
              className="hidden shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-muted-foreground transition hover:text-foreground sm:flex"
            >
              <Plus className="h-3.5 w-3.5" /> New
            </button>
          </div>
        </div>
      )}

      {showResults ? (
        <ResultsView
          query={queryParam}
          mode={mode}
          loading={loading}
          error={error}
          result={result}
          elapsed={elapsed}
          saved={saved}
          onToggleSave={onToggleSave}
          onRegenerate={() => runSearch(queryParam, mode)}
          onFollowUp={(q) => submit(q, mode)}
          onNewSearch={newSearch}
        />
      ) : (
        <SearchHero query={query || activeQuery} setQuery={setQuery} mode={mode} setMode={changeMode} onSubmit={submit} />
      )}
    </div>
  );
}