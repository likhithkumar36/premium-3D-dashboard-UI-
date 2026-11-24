import { Activity, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { PERFORMANCE_METRICS } from '../data/dashboardData';
import type { PerformanceTabKey } from '../types/dashboard';
import { TiltCard } from './TiltCard';

interface PerformancePanelProps {
  tiltEnabled: boolean;
  onDiagnosticsComplete: (summary: string) => void;
}

const ACCENT_STYLES = {
  sky: {
    bar: 'from-sky-400 to-cyan-300',
    glow: 'shadow-[0_0_16px_rgba(56,189,248,0.4)]',
    text: 'text-sky-300',
  },
  indigo: {
    bar: 'from-indigo-400 to-violet-400',
    glow: 'shadow-[0_0_16px_rgba(129,140,248,0.4)]',
    text: 'text-indigo-300',
  },
  emerald: {
    bar: 'from-emerald-400 to-teal-300',
    glow: 'shadow-[0_0_16px_rgba(52,211,153,0.35)]',
    text: 'text-emerald-300',
  },
  amber: {
    bar: 'from-amber-400 to-orange-300',
    glow: 'shadow-[0_0_16px_rgba(251,191,36,0.35)]',
    text: 'text-amber-300',
  },
};

export function PerformancePanel({
  tiltEnabled,
  onDiagnosticsComplete,
}: PerformancePanelProps) {
  const [activeTab, setActiveTab] = useState<PerformanceTabKey>('compute');
  const [diagState, setDiagState] = useState<'idle' | 'running' | 'done'>('idle');
  const [diagProgress, setDiagProgress] = useState(0);

  const metrics = PERFORMANCE_METRICS[activeTab];

  const handleRunDiagnostics = () => {
    if (diagState === 'running') return;
    setDiagState('running');
    setDiagProgress(12);

    const steps = [38, 66, 89, 100];
    steps.forEach((pct, index) => {
      window.setTimeout(() => {
        setDiagProgress(pct);
        if (pct === 100) {
          setDiagState('done');
          onDiagnosticsComplete(
            'All 4 availability zones verified · 0 packet anomalies detected'
          );
          window.setTimeout(() => {
            setDiagState('idle');
            setDiagProgress(0);
          }, 4000);
        }
      }, (index + 1) * 320);
    });
  };

  return (
    <TiltCard
      tiltEnabled={tiltEnabled}
      maxTilt={2.4}
      glowAccent="sky"
      className="p-6"
    >
      <div className="flex flex-col gap-5 h-full justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              System Performance
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Resource saturation, edge cache health, and SLA headroom
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Performance category"
            className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 self-start sm:self-auto"
          >
            {(['compute', 'network', 'storage'] as PerformanceTabKey[]).map(
              (tab) => {
                const active = activeTab === tab;
                return (
                  <button
                    key={tab}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                      active
                        ? 'bg-sky-500/20 text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="space-y-5">
          {metrics.map((item) => {
            const style = ACCENT_STYLES[item.accent];
            return (
              <div key={item.id} className="space-y-2">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium text-slate-200">
                    {item.label}
                  </span>
                  <div className="flex items-baseline gap-2.5 font-mono tabular-nums">
                    <span className="text-xs text-slate-400">
                      {item.maxLabel}
                    </span>
                    <span className={`text-sm font-semibold ${style.text}`}>
                      {item.value}%
                    </span>
                  </div>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.06] p-[1px]">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${style.bar} ${style.glow} transition-[width] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]`}
                    style={{ width: `${Math.min(100, item.value)}%` }}
                  />
                </div>

                <p className="text-xs text-slate-500">{item.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Interactive Diagnostics Bar */}
        <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-xs text-slate-300 min-w-0">
            {diagState === 'running' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-sky-400 shrink-0" />
                <span className="truncate font-mono tabular-nums">
                  Verifying mesh health · {diagProgress}%
                </span>
              </>
            ) : diagState === 'done' ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="truncate text-emerald-300">
                  Mesh diagnostics passed across all zones
                </span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0" />
                <span className="truncate text-slate-400">
                  Continuous integrity checks active across 4 regions
                </span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={handleRunDiagnostics}
            disabled={diagState === 'running'}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-2 text-xs font-medium text-slate-100 transition-all duration-150 hover:border-sky-400/40 hover:bg-sky-500/15 disabled:opacity-50 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            <Activity className="h-3.5 w-3.5 text-sky-400" />
            {diagState === 'running' ? 'Running Checks...' : 'Run Diagnostics'}
          </button>
        </div>
      </div>
    </TiltCard>
  );
}
