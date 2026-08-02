import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyzeCode, analyzePattern, type Mode, type AnalysisResult, type PatternResult } from '../api';
import { fetchGitHubFile } from '../utils/github';
import { fetchHistory, saveHistory, clearHistoryStore, type HistoryItem } from '../utils/history';
import { useAuth } from '../hooks/useAuth';

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconScan = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/>
    <line x1="7" y1="12" x2="17" y2="12"/>
  </svg>
);

const IconCpu = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="16" height="16" rx="2"/>
    <rect x="9" y="9" width="6" height="6"/>
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2"/>
  </svg>
);

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
);

const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);

const IconExternalLink = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

const IconGithub = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const IconHistory = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const IconTrash = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const IconTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const IconGoogle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
  </svg>
);

// ─── Severity Badge Component ──────────────────────────────────────────────────

const severityConfig = {
  high: {
    label: 'High Severity',
    dotColor: 'bg-red-400',
    classes: 'bg-red-500/10 text-red-400 border border-red-500/30',
  },
  medium: {
    label: 'Medium Severity',
    dotColor: 'bg-amber-400',
    classes: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
  },
  low: {
    label: 'Low Severity',
    dotColor: 'bg-green-400',
    classes: 'bg-green-500/10 text-green-400 border border-green-500/30',
  },
};

function SeverityBadge({ severity }: { severity: 'high' | 'medium' | 'low' }) {
  const cfg = severityConfig[severity];
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 text-[11px] font-mono-code font-bold uppercase tracking-wider ${cfg.classes}`}>
      <span className={`w-1.5 h-1.5 ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

// ─── Pattern Tracker Card Component ──────────────────────────────────────────

function PatternTrackerCard({ patternResult, isAnalyzing }: { patternResult: PatternResult | null; isAnalyzing: boolean }) {
  if (isAnalyzing) {
    return (
      <div className="p-5 border border-[#262626] bg-[#0F0F0F] animate-pulse flex flex-col gap-2 relative">
        <div className="h-1 w-16 bg-[#FF3D00]" />
        <div className="h-4 bg-[#1A1A1A] w-1/3 mt-2" />
        <div className="h-3 bg-[#1A1A1A] w-3/4" />
      </div>
    );
  }

  if (!patternResult) return null;

  return (
    <div className="p-5 border border-[#262626] bg-[#0F0F0F] flex flex-col gap-3 relative">
      <div className="h-1 w-16 bg-[#FF3D00] absolute top-0 left-0" />
      <div className="flex items-center gap-2 text-[#FF3D00] pt-1">
        <IconTarget />
        <span className="text-xs font-mono-code font-bold uppercase tracking-widest">Recurring Pattern Detected</span>
      </div>
      <div>
        <p className="text-sm font-bold text-white font-display tracking-tight leading-snug">{patternResult.pattern}</p>
        <p className="text-xs text-neutral-400 mt-1.5 font-normal leading-relaxed">
          <span className="font-semibold text-neutral-200 font-mono-code uppercase tracking-wider">Focus Area:</span> {patternResult.focus}
        </p>
      </div>
    </div>
  );
}

// ─── Diagnosis Card Component ────────────────────────────────────────────────

interface DiagnosisCardProps {
  result: AnalysisResult | null;
  isLoading: boolean;
  error: string | null;
  patternResult: PatternResult | null;
  isPatternLoading: boolean;
  historyCount: number;
}

function DiagnosisCard({ result, isLoading, error, patternResult, isPatternLoading, historyCount }: DiagnosisCardProps) {
  if (!result && !isLoading && !error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-4 py-16">
        <div className="w-12 h-12 flex items-center justify-center bg-[#1A1A1A] border border-[#262626] text-neutral-500">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35M11 8v3M11 14h.01"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold uppercase tracking-wider font-mono-code text-neutral-300">
            No diagnosis yet
          </p>
          <p className="text-xs text-neutral-500 mt-1.5">
            Paste code or a GitHub URL and click Analyze Code
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8 gap-3 py-16">
        <div className="w-12 h-12 flex items-center justify-center bg-red-950/30 border border-red-800/40 text-red-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        </div>
        <p className="text-xs font-mono-code uppercase tracking-wider text-red-400">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex flex-col gap-6 animate-pulse">
        <div className="flex items-start justify-between gap-3">
          <div className="h-6 bg-[#1A1A1A] w-2/3" />
          <div className="h-6 bg-[#1A1A1A] w-24" />
        </div>
        <div className="h-px bg-[#262626]" />
        {[48, 36, 56].map((h, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="h-3 bg-[#1A1A1A] w-1/4" />
            <div className="bg-[#1A1A1A]" style={{ height: h }} />
          </div>
        ))}
        <div className="h-10 bg-[#1A1A1A] mt-auto" />
      </div>
    );
  }

  if (!result) return null;

  const drillUrl = `https://www.interviewcake.com/concept/${result.drill_topic}`;

  return (
    <div className="p-6 flex flex-col gap-6 h-full">
      {historyCount >= 3 && (
        <PatternTrackerCard patternResult={patternResult} isAnalyzing={isPatternLoading} />
      )}

      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-bold font-display tracking-tight text-white leading-snug">
          {result.blind_spot}
        </h2>
        <SeverityBadge severity={result.severity} />
      </div>

      <div className="h-px bg-[#262626]" />

      <section>
        <p className="text-xs font-mono-code font-bold uppercase tracking-[0.15em] text-[#FF3D00] mb-2">
          Why It Matters
        </p>
        <p className="text-sm leading-relaxed text-neutral-300">
          {result.why}
        </p>
      </section>

      <section>
        <p className="text-xs font-mono-code font-bold uppercase tracking-[0.15em] text-[#FF3D00] mb-2">
          Recommended Fix
        </p>
        <div className="p-4 bg-[#141414] border border-[#262626] text-sm leading-relaxed text-neutral-200">
          {result.fix}
        </div>
      </section>

      <div className="mt-auto pt-2">
        <a
          id="drill-link"
          href={drillUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between w-full p-4 border border-[#FF3D00] text-[#FF3D00] bg-transparent hover:bg-[#FF3D00] hover:text-[#0A0A0A] font-mono-code font-bold text-xs uppercase tracking-widest transition-colors"
        >
          <span>Drill Concept: <span className="font-bold">{result.drill_topic}</span></span>
          <IconExternalLink />
        </a>
      </div>
    </div>
  );
}

// ─── Mode Toggle Component ────────────────────────────────────────────────────

function ModeToggle({ mode, onChange, disabled }: { mode: Mode; onChange: (m: Mode) => void; disabled: boolean }) {
  return (
    <div className="inline-flex bg-[#141414] border border-[#262626] p-0.5">
      {(['algo', 'security'] as const).map((m) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            disabled={disabled}
            onClick={() => onChange(m)}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-mono-code font-bold uppercase tracking-wider transition-colors disabled:opacity-50 ${
              active
                ? 'bg-[#FF3D00] text-[#0A0A0A]'
                : 'text-neutral-400 hover:text-white bg-transparent'
            }`}
          >
            {m === 'algo' ? <IconCpu /> : <IconShield />}
            {m === 'algo' ? 'Algo' : 'Security'}
          </button>
        );
      })}
    </div>
  );
}

// ─── Main AppPage Component ────────────────────────────────────────────────────

const PLACEHOLDER_CODE = `function twoSum(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) {
        return [i, j];
      }
    }
  }
}`;

export default function AppPage() {
  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();

  const [code, setCode] = useState('');
  const [mode, setMode] = useState<Mode>('algo');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // History & Pattern state
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistorySidebar, setShowHistorySidebar] = useState(false);

  // GitHub URL fetch state
  const [githubUrl, setGithubUrl] = useState('');
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);

  // Pattern Tracker state
  const [patternResult, setPatternResult] = useState<PatternResult | null>(null);
  const [isPatternLoading, setIsPatternLoading] = useState(false);

  useEffect(() => {
    fetchHistory(user?.id).then((items) => setHistory(items));
  }, [user?.id]);

  const updatePatternTracker = useCallback(async (currentHistory: HistoryItem[]) => {
    if (currentHistory.length >= 3) {
      setIsPatternLoading(true);
      try {
        const topics = currentHistory.map((h) => ({
          blind_spot: h.result.blind_spot,
          drill_topic: h.result.drill_topic,
        }));
        const patternData = await analyzePattern(topics);
        setPatternResult(patternData);
      } catch (err) {
        console.warn('Pattern analysis failed:', err);
      } finally {
        setIsPatternLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (history.length >= 3) {
      updatePatternTracker(history);
    }
  }, [history, updatePatternTracker]);

  const handleAnalyze = useCallback(async () => {
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const data = await analyzeCode(code, mode);
      setResult(data);

      const updatedHistory = await saveHistory(code, mode, data, user?.id);
      setHistory(updatedHistory);

      if (updatedHistory.length >= 3) {
        updatePatternTracker(updatedHistory);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [code, mode, user?.id, updatePatternTracker]);

  const handleFetchGithub = async () => {
    if (!githubUrl.trim()) return;
    setGithubError(null);
    setIsFetchingGithub(true);
    try {
      const fetchedCode = await fetchGitHubFile(githubUrl);
      setCode(fetchedCode);
      setGithubUrl('');
    } catch (err) {
      setGithubError(err instanceof Error ? err.message : 'Failed to fetch GitHub file.');
    } finally {
      setIsFetchingGithub(false);
    }
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setCode(item.code);
    setMode(item.mode);
    setResult(item.result);
    setError(null);
  };

  const handleClearHistory = async () => {
    const cleared = await clearHistoryStore(user?.id);
    setHistory(cleared);
    setPatternResult(null);
  };

  const userName = user?.user_metadata?.full_name || user?.email || 'User';
  const userAvatar = user?.user_metadata?.avatar_url;

  return (
    <div className="app-shell">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <Link to="/" className="flex items-center gap-2 text-inherit no-underline">
              <div className="logo-mark">
                <IconScan />
              </div>
              <span className="logo-wordmark">CodeLens</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowHistorySidebar((prev) => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono-code uppercase font-bold tracking-wider bg-[#1A1A1A] text-neutral-300 border border-[#262626] hover:border-[#FF3D00] transition-colors"
            >
              <IconHistory />
              History ({history.length})
            </button>

            {!authLoading && (
              user ? (
                <div className="flex items-center gap-3 pl-3 border-l border-[#262626]">
                  {userAvatar ? (
                    <img src={userAvatar} alt={userName} className="w-6 h-6 border border-[#404040]" />
                  ) : (
                    <div className="w-6 h-6 bg-[#FF3D00] text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center uppercase font-mono-code">
                      {userName.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-mono-code text-neutral-300 hidden sm:inline">{userName}</span>
                  <button
                    type="button"
                    onClick={signOut}
                    className="text-xs uppercase font-mono-code text-neutral-500 hover:text-neutral-200 transition-colors"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono-code uppercase font-bold tracking-wider bg-[#1A1A1A] text-neutral-300 border border-[#262626] hover:border-[#FF3D00] transition-colors"
                >
                  <IconGoogle />
                  Sign in
                </button>
              )
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="main-layout">
        {/* History Sidebar */}
        {showHistorySidebar && (
          <aside className="panel w-64 flex-shrink-0 flex flex-col">
            <div className="panel-header">
              <h2 className="panel-title flex items-center gap-1.5">
                <IconHistory /> History {user ? '(Cloud)' : '(Local)'}
              </h2>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-xs font-mono-code uppercase text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                >
                  <IconTrash /> Clear
                </button>
              )}
            </div>

            <div className="panel-body p-3 flex flex-col gap-2">
              {history.length === 0 ? (
                <p className="text-xs font-mono-code uppercase text-neutral-600 text-center py-6">No saved history</p>
              ) : (
                history.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleRestoreHistory(item)}
                    className="text-left p-3 bg-[#141414] border border-[#262626] hover:border-[#FF3D00] transition-colors flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono-code text-neutral-500">
                      <span className="uppercase font-bold text-[#FF3D00]">{item.mode}</span>
                      <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs font-bold font-display text-neutral-200 line-clamp-2">{item.result.blind_spot}</p>
                  </button>
                ))
              )}
            </div>
          </aside>
        )}

        {/* Left Panel: GitHub & Code Editor */}
        <section className="panel flex-1" aria-label="Code input">
          <div className="p-3 border-b border-[#262626] bg-[#0F0F0F] flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="url"
                  placeholder="Paste GitHub File URL (github.com/user/repo/blob/...)"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetchGithub()}
                  disabled={isFetchingGithub}
                  className="w-full pl-8 pr-3 py-2 text-xs font-mono-code bg-[#1A1A1A] border border-[#262626] focus:border-[#FF3D00] text-neutral-200 placeholder-neutral-500 outline-none transition-colors"
                />
                <div className="absolute left-2.5 top-2.5 text-neutral-500">
                  <IconGithub />
                </div>
              </div>
              <button
                type="button"
                onClick={handleFetchGithub}
                disabled={isFetchingGithub || !githubUrl.trim()}
                className="px-4 py-2 text-xs font-mono-code uppercase font-bold tracking-wider bg-[#1A1A1A] text-neutral-200 border border-[#262626] hover:border-[#FF3D00] transition-colors disabled:opacity-50"
              >
                {isFetchingGithub ? 'Fetching…' : 'Fetch'}
              </button>
            </div>

            {githubError && (
              <p className="text-xs font-mono-code text-red-400 px-1">{githubError}</p>
            )}
          </div>

          <div className="panel-header">
            <h1 className="panel-title">Source Code</h1>
            <ModeToggle mode={mode} onChange={setMode} disabled={isLoading} />
          </div>

          <div className="textarea-wrap">
            <textarea
              id="code-input"
              className="code-textarea"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && handleAnalyze()}
              placeholder={PLACEHOLDER_CODE}
              spellCheck={false}
              autoComplete="off"
            />
          </div>

          <div className="panel-footer">
            <span className="shortcut-hint">
              {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'} + ENTER TO ANALYZE
            </span>
            <button
              id="analyze-btn"
              type="button"
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner" />
                  ANALYZING…
                </>
              ) : (
                <>
                  ANALYZE CODE
                  <IconArrow />
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Panel: Diagnosis */}
        <section className="panel flex-1" aria-label="Diagnosis output" aria-live="polite">
          <div className="panel-header">
            <h2 className="panel-title">Diagnosis Report</h2>
            {result && (
              <span className="text-xs font-mono-code uppercase text-neutral-500">
                {mode === 'algo' ? 'Algorithm' : 'Security'} Mode
              </span>
            )}
          </div>
          <div className="panel-body">
            <DiagnosisCard
              result={result}
              isLoading={isLoading}
              error={error}
              patternResult={patternResult}
              isPatternLoading={isPatternLoading}
              historyCount={history.length}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
