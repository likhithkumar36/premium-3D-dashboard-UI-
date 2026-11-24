import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Server,
  Shield,
  Sliders,
  UserPlus,
} from 'lucide-react';
import { useState } from 'react';
import { PROFILE_AVATAR_URL } from '../data/dashboardData';
import type {
  ActivityCategory,
  ActivityItem,
  ChartMetricKey,
  ChartPoint,
  DashboardPreferences,
  DeploymentNode,
  RegionAllocation,
  TeamMember,
  TimeframeKey,
} from '../types/dashboard';
import { InteractiveAreaChart } from './InteractiveAreaChart';
import { PerformancePanel } from './PerformancePanel';
import { RegionalDistributionChart } from './RegionalDistributionChart';
import { TiltCard } from './TiltCard';

export function AnalyticsView({
  chartData,
  regions,
  timeframe,
  onTimeframeChange,
  activeMetric,
  onMetricChange,
  tiltEnabled,
  onDiagnosticsComplete,
}: {
  chartData: ChartPoint[];
  regions: RegionAllocation[];
  timeframe: TimeframeKey;
  onTimeframeChange: (tf: TimeframeKey) => void;
  activeMetric: ChartMetricKey;
  onMetricChange: (m: ChartMetricKey) => void;
  tiltEnabled: boolean;
  onDiagnosticsComplete: (msg: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Deep Telemetry Analytics
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Cross-region request flow, revenue velocity, and saturation trends
          </p>
        </div>

        <div
          role="group"
          aria-label="Analytics timeframe"
          className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 self-start sm:self-auto"
        >
          {(['24h', '7d', '30d', '90d'] as TimeframeKey[]).map((tf) => (
            <button
              key={tf}
              type="button"
              onClick={() => onTimeframeChange(tf)}
              className={`rounded-lg px-3 py-1.5 text-xs font-mono font-medium transition-colors cursor-pointer ${
                timeframe === tf
                  ? 'bg-sky-500/20 text-sky-200'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <InteractiveAreaChart
        data={chartData}
        timeframe={timeframe}
        tiltEnabled={tiltEnabled}
        activeMetric={activeMetric}
        onMetricChange={onMetricChange}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
        <div className="lg:col-span-5">
          <RegionalDistributionChart
            regions={regions}
            tiltEnabled={tiltEnabled}
          />
        </div>
        <div className="lg:col-span-7">
          <PerformancePanel
            tiltEnabled={tiltEnabled}
            onDiagnosticsComplete={onDiagnosticsComplete}
          />
        </div>
      </div>
    </div>
  );
}

export function DeploymentsView({
  deployments,
  searchQuery,
  tiltEnabled,
  onNewDeployment,
  onRestartNode,
}: {
  deployments: DeploymentNode[];
  searchQuery: string;
  tiltEnabled: boolean;
  onNewDeployment: () => void;
  onRestartNode: (id: string) => void;
}) {
  const [envFilter, setEnvFilter] = useState<'All' | DeploymentNode['environment']>('All');

  const filtered = deployments.filter((d) => {
    const matchEnv = envFilter === 'All' || d.environment === envFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      d.service.toLowerCase().includes(q) ||
      d.region.toLowerCase().includes(q) ||
      d.version.toLowerCase().includes(q);
    return matchEnv && matchQuery;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Cluster Deployments
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Active service workloads, rolling versions, and node resource load
          </p>
        </div>

        <button
          type="button"
          onClick={onNewDeployment}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-400 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          New Deployment
        </button>
      </div>

      <TiltCard tiltEnabled={tiltEnabled} maxTilt={1.6} className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-white/[0.06]">
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 self-start">
            {(['All', 'Production', 'Canary', 'Staging'] as const).map((env) => (
              <button
                key={env}
                type="button"
                onClick={() => setEnvFilter(env)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  envFilter === env
                    ? 'bg-sky-500/20 text-sky-200'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {filtered.length} active workloads
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/[0.06] text-xs text-slate-400">
                <th className="py-3 pr-4 font-medium">Service</th>
                <th className="py-3 px-4 font-medium">Environment</th>
                <th className="py-3 px-4 font-medium">Region</th>
                <th className="py-3 px-4 font-medium">Release</th>
                <th className="py-3 px-4 font-medium text-right">CPU</th>
                <th className="py-3 px-4 font-medium text-right">Memory</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 pl-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-sm">
              {filtered.map((node) => (
                <tr
                  key={node.id}
                  className="transition-colors hover:bg-white/[0.02]"
                >
                  <td className="py-3.5 pr-4 font-mono text-xs font-medium text-white whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <Server className="h-4 w-4 text-sky-400 shrink-0" />
                      {node.service}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-300 whitespace-nowrap">
                    {node.environment}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-slate-400 whitespace-nowrap">
                    {node.region}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-300 whitespace-nowrap">
                    {node.version}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-200 text-right tabular-nums whitespace-nowrap">
                    {node.cpuLoad}%
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-200 text-right tabular-nums whitespace-nowrap">
                    {node.memoryPct}%
                  </td>
                  <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 font-medium ${
                        node.status === 'Degraded'
                          ? 'text-amber-300'
                          : node.status === 'Deploying'
                            ? 'text-sky-300'
                            : 'text-emerald-300'
                      }`}
                    >
                      {node.status === 'Degraded' ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      {node.status}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => onRestartNode(node.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-2.5 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:border-sky-400/40 hover:text-white cursor-pointer"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Recycle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TiltCard>
    </div>
  );
}

export function ActivityLogView({
  activities,
  searchQuery,
  tiltEnabled,
  onInspectActivity,
}: {
  activities: ActivityItem[];
  searchQuery: string;
  tiltEnabled: boolean;
  onInspectActivity: (item: ActivityItem) => void;
}) {
  const [cat, setCat] = useState<ActivityCategory>('all');
  const filtered = activities.filter((item) => {
    const matchCat = cat === 'all' || item.category === cat;
    const q = searchQuery.trim().toLowerCase();
    const matchQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.actor.toLowerCase().includes(q) ||
      item.region.toLowerCase().includes(q);
    return matchCat && matchQuery;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Audit & Activity Log
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Complete immutable record of cluster changes, security checks, and billing events
        </p>
      </div>

      <TiltCard tiltEnabled={tiltEnabled} maxTilt={1.5} className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
          <div className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
            {(['all', 'deployment', 'security', 'billing'] as ActivityCategory[]).map(
              (c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCat(c)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors cursor-pointer ${
                    cat === c
                      ? 'bg-sky-500/20 text-sky-200'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {c === 'deployment' ? 'Deployments' : c}
                </button>
              )
            )}
          </div>
          <span className="text-xs font-mono text-slate-400 tabular-nums">
            {filtered.length} events
          </span>
        </div>

        <div className="mt-2 divide-y divide-white/[0.06]">
          {filtered.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onInspectActivity(item)}
              className="flex w-full items-start justify-between gap-4 py-4 text-left hover:bg-white/[0.02] px-2 -mx-2 rounded-xl transition-colors cursor-pointer"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-white">{item.title}</p>
                <p className="mt-1 text-xs text-slate-400">{item.summary}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span>{item.actor}</span>
                  <span aria-hidden="true">·</span>
                  <span>{item.region}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono">{item.commitOrRef}</span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`text-xs font-medium ${
                    item.status === 'Warning'
                      ? 'text-amber-300'
                      : 'text-emerald-300'
                  }`}
                >
                  {item.status}
                </span>
                <p className="mt-1 text-xs font-mono text-slate-500">
                  {item.timestamp}
                </p>
              </div>
            </button>
          ))}
        </div>
      </TiltCard>
    </div>
  );
}

export function TeamView({
  members,
  tiltEnabled,
  onOpenInvite,
}: {
  members: TeamMember[];
  tiltEnabled: boolean;
  onOpenInvite: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Workspace Team
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Operators, security architects, and role-based access permissions
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenInvite}
          className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-sky-400 self-start sm:self-auto cursor-pointer whitespace-nowrap shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          Invite Member
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {members.map((member) => (
          <TiltCard
            key={member.id}
            tiltEnabled={tiltEnabled}
            maxTilt={3}
            className="p-5"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/[0.12] bg-gradient-to-br from-sky-500/25 to-indigo-500/25 flex items-center justify-center">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-sky-200">
                      {member.initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {member.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {member.role} · {member.department}
                  </p>
                  <p className="mt-0.5 text-xs font-mono text-slate-500 truncate">
                    {member.email}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-sky-300">
                  <Shield className="h-3.5 w-3.5" />
                  {member.accessLevel}
                </span>
                <p className="mt-1 text-xs text-slate-500">
                  {member.lastActive}
                </p>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}

export function SettingsView({
  preferences,
  onUpdatePreference,
  tiltEnabled,
}: {
  preferences: DashboardPreferences;
  onUpdatePreference: (key: keyof DashboardPreferences, val: boolean) => void;
  tiltEnabled: boolean;
}) {
  const toggles: Array<{
    key: keyof DashboardPreferences;
    title: string;
    description: string;
  }> = [
    {
      key: 'tilt3D',
      title: '3D Perspective Card Tilt',
      description:
        'Subtle cursor-tracking 3D depth, lift, and glass specular reflections on cards.',
    },
    {
      key: 'ambientParticles',
      title: 'Subtle Background Particle Field',
      description:
        'Low-contrast 60fps floating ambient particles across the dark backdrop.',
    },
    {
      key: 'ambientGlow',
      title: 'Cinematic Radial Lighting',
      description:
        'Soft electric blue and indigo atmospheric illumination behind glass panels.',
    },
    {
      key: 'compactDensity',
      title: 'Compact Grid Spacing',
      description:
        'Tightens dashboard vertical rhythm for high-density monitoring displays.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
          Control Preferences
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Customize spatial 3D effects, motion intensity, and operator profile details
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <TiltCard tiltEnabled={tiltEnabled} maxTilt={2} className="p-6">
            <div className="flex items-center gap-2.5 border-b border-white/[0.06] pb-4">
              <Sliders className="h-4 w-4 text-sky-400" />
              <h2 className="text-base font-semibold text-white">
                Spatial UI & Performance
              </h2>
            </div>

            <div className="mt-2 divide-y divide-white/[0.06]">
              {toggles.map((item) => {
                const enabled = preferences[item.key];
                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-100">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={enabled}
                      onClick={() => onUpdatePreference(item.key, !enabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                        enabled
                          ? 'border-sky-400/50 bg-sky-500/80'
                          : 'border-white/[0.12] bg-white/[0.08]'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                          enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </TiltCard>
        </div>

        <div className="lg:col-span-5">
          <TiltCard tiltEnabled={tiltEnabled} maxTilt={2.5} className="p-6">
            <div className="flex items-center gap-4 border-b border-white/[0.06] pb-5">
              <img
                src={PROFILE_AVATAR_URL}
                alt="Elena Vance"
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-2xl border border-white/[0.14] object-cover"
              />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Elena Vance
                </h2>
                <p className="text-xs text-slate-400">
                  VP of Platform Operations · Workspace Owner
                </p>
                <p className="mt-1 text-xs font-mono text-sky-300">
                  elena.vance@kestrelops.io
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-xs">
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Primary Region</span>
                <span className="font-medium text-slate-200">
                  US East · Virginia
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Hardware Key MFA</span>
                <span className="font-medium text-emerald-300">Enforced</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Audit Retention</span>
                <span className="font-mono text-slate-200">365 days</span>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}
