import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CreditCard,
  Rocket,
  Shield,
} from 'lucide-react';
import { useState } from 'react';
import type { ActivityCategory, ActivityItem } from '../types/dashboard';
import { TiltCard } from './TiltCard';

interface RecentActivityPanelProps {
  activities: ActivityItem[];
  searchQuery: string;
  tiltEnabled: boolean;
  onInspectActivity: (activity: ActivityItem) => void;
  onViewAll: () => void;
}

const CATEGORY_ICON = {
  deployment: Rocket,
  security: Shield,
  billing: CreditCard,
};

export function RecentActivityPanel({
  activities,
  searchQuery,
  tiltEnabled,
  onInspectActivity,
  onViewAll,
}: RecentActivityPanelProps) {
  const [filter, setFilter] = useState<ActivityCategory>('all');

  const filtered = activities.filter((item) => {
    const matchesCategory = filter === 'all' || item.category === filter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.actor.toLowerCase().includes(q) ||
      item.region.toLowerCase().includes(q) ||
      item.commitOrRef.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <TiltCard
      tiltEnabled={tiltEnabled}
      maxTilt={2.2}
      glowAccent="indigo"
      className="p-6"
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              Recent Activity
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Latest infrastructure deployments, security checks, and billing events
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div
              role="tablist"
              aria-label="Filter recent activity"
              className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1"
            >
              {(['all', 'deployment', 'security', 'billing'] as ActivityCategory[]).map(
                (cat) => {
                  const selected = filter === cat;
                  return (
                    <button
                      key={cat}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setFilter(cat)}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-medium capitalize transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                        selected
                          ? 'bg-sky-500/20 text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat === 'deployment' ? 'Deployments' : cat}
                    </button>
                  );
                }
              )}
            </div>

            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-medium text-sky-300 transition-colors hover:bg-sky-500/10 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              View log
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Clean Hairline-Divided Feed */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center border-t border-white/[0.06]">
            <p className="text-sm font-medium text-slate-300">
              No matching events found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Try clearing your search filter or switching activity categories.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
            {filtered.slice(0, 5).map((item) => {
              const Icon = CATEGORY_ICON[item.category];
              const isWarning = item.status === 'Warning';

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onInspectActivity(item)}
                  className="group/row flex w-full items-start justify-between gap-4 py-3.5 text-left transition-colors hover:bg-white/[0.02] px-2 -mx-2 rounded-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-sky-300 transition-colors group-hover/row:border-sky-400/30 group-hover/row:bg-sky-500/10">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate group-hover/row:text-white">
                        {item.title}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
                        <span>{item.actor}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.region}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-slate-500">
                          {item.commitOrRef}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        isWarning ? 'text-amber-300' : 'text-emerald-300'
                      }`}
                    >
                      {isWarning ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {item.status}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-500">
                      {item.timestamp}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </TiltCard>
  );
}
