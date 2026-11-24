import {
  Download,
  Layers,
  Plus,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import {
  ActivityInspectorModal,
  InviteMemberModal,
  NewDeploymentModal,
} from './components/ActionModals';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { InteractiveAreaChart } from './components/InteractiveAreaChart';
import { KpiStatsGrid } from './components/KpiStatsGrid';
import { PerformancePanel } from './components/PerformancePanel';
import { RecentActivityPanel } from './components/RecentActivityPanel';
import { RegionalDistributionChart } from './components/RegionalDistributionChart';
import {
  ActivityLogView,
  AnalyticsView,
  DeploymentsView,
  SettingsView,
  TeamView,
} from './components/SecondaryViews';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import {
  CHART_SERIES_BY_TIMEFRAME,
  DEFAULT_PREFERENCES,
  INITIAL_ACTIVITIES,
  INITIAL_DEPLOYMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_TEAM,
  KPI_BY_TIMEFRAME,
  REGIONS_BY_TIMEFRAME,
} from './data/dashboardData';
import type {
  ActivityItem,
  ChartMetricKey,
  DashboardPreferences,
  DeploymentNode,
  NavSection,
  NotificationItem,
  TeamMember,
  TimeframeKey,
} from './types/dashboard';

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [timeframe, setTimeframe] = useState<TimeframeKey>('30d');
  const [chartMetric, setChartMetric] = useState<ChartMetricKey>('revenue');
  const [searchQuery, setSearchQuery] = useState('');

  const [preferences, setPreferences] =
    useState<DashboardPreferences>(DEFAULT_PREFERENCES);
  const [activities, setActivities] =
    useState<ActivityItem[]>(INITIAL_ACTIVITIES);
  const [deployments, setDeployments] =
    useState<DeploymentNode[]>(INITIAL_DEPLOYMENTS);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [notifications, setNotifications] = useState<NotificationItem[]>(
    INITIAL_NOTIFICATIONS
  );

  const [deployModalOpen, setDeployModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [inspectedActivity, setInspectedActivity] =
    useState<ActivityItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3600);
  };

  const handleUpdatePreference = (
    key: keyof DashboardPreferences,
    val: boolean
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: val }));
  };

  const handleExportReport = () => {
    const kpis = KPI_BY_TIMEFRAME[timeframe];
    const rows = [
      ['Metric', 'Value', 'Delta', 'Context'],
      ...kpis.map((k) => [
        k.label,
        `${k.prefix ?? ''}${k.value}${k.suffix ?? ''}`,
        `${k.delta}%`,
        k.context,
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kestrel-telemetry-${timeframe}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Exported ${timeframe.toUpperCase()} telemetry report (CSV)`);
  };

  const handleCreateDeployment = (
    service: string,
    environment: DeploymentNode['environment'],
    region: string,
    version: string
  ) => {
    const newNode: DeploymentNode = {
      id: `dep-${Date.now()}`,
      service,
      environment,
      region,
      version,
      status: 'Healthy',
      cpuLoad: 34,
      memoryPct: 42,
      uptime: '100.0%',
      lastUpdated: 'Just now',
    };
    setDeployments((prev) => [newNode, ...prev]);

    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      title: `Deployed ${service} (${version})`,
      actor: 'Elena Vance',
      category: 'deployment',
      region,
      status: 'Completed',
      timestamp: 'Just now',
      summary: `Rolled out ${environment.toLowerCase()} release ${version} to ${region} with zero dropped connections.`,
      commitOrRef: `rel-${Date.now().toString().slice(-6)}`,
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast(`Deployed ${service} ${version} to ${region}`);
  };

  const handleRestartNode = (id: string) => {
    const target = deployments.find((d) => d.id === id);
    if (!target) return;
    setDeployments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status: 'Healthy',
              cpuLoad: Math.max(24, d.cpuLoad - 14),
              lastUpdated: 'Just now',
            }
          : d
      )
    );
    showToast(`Recycled ${target.service} cleanly`);
  };

  const handleInviteMember = (
    name: string,
    email: string,
    role: string,
    accessLevel: TeamMember['accessLevel']
  ) => {
    const parts = name.split(' ').filter(Boolean);
    const initials =
      parts.length >= 2
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : name.slice(0, 2).toUpperCase();

    const newMember: TeamMember = {
      id: `tm-${Date.now()}`,
      name,
      email,
      role,
      department: 'Operations',
      accessLevel,
      lastActive: 'Invited just now',
      initials,
    };
    setTeam((prev) => [newMember, ...prev]);
    showToast(`Invitation sent to ${name}`);
  };

  const handleDiagnosticsComplete = (summary: string) => {
    const newAct: ActivityItem = {
      id: `act-${Date.now()}`,
      title: 'Full mesh diagnostics verified',
      actor: 'Elena Vance',
      category: 'security',
      region: 'Global Mesh',
      status: 'Verified',
      timestamp: 'Just now',
      summary,
      commitOrRef: `diag-${Date.now().toString().slice(-5)}`,
    };
    setActivities((prev) => [newAct, ...prev]);
    showToast(summary);
  };

  const handleSelectKpiMetric = (metricId: string) => {
    if (metricId === 'revenue') setChartMetric('revenue');
    else if (metricId === 'throughput') setChartMetric('throughput');
    else if (metricId === 'nodes' || metricId === 'latency')
      setChartMetric('compute');
  };

  const kpis = KPI_BY_TIMEFRAME[timeframe];
  const chartData = CHART_SERIES_BY_TIMEFRAME[timeframe];
  const regions = REGIONS_BY_TIMEFRAME[timeframe];

  const sectionSpacing = preferences.compactDensity ? 'space-y-5' : 'space-y-6';

  return (
    <div className="relative min-h-screen flex bg-[#06070b] text-slate-100">
      <AmbientBackdrop
        particlesEnabled={preferences.ambientParticles}
        glowEnabled={preferences.ambientGlow}
      />

      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <TopBar
          activeSection={activeSection}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          notifications={notifications}
          onMarkAllRead={() =>
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          }
          onToggleNotificationRead={(id) =>
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
            )
          }
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onNavigate={setActiveSection}
        />

        <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeSection === 'overview' && (
                <div className={sectionSpacing}>
                  {/* Welcome Header & Quick Actions */}
                  <section
                    aria-label="Workspace Welcome"
                    className="relative overflow-hidden rounded-2xl border border-white/[0.08] glass-surface p-6 sm:p-7"
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-sky-500/[0.12] blur-3xl"
                    />
                    <div className="relative z-10 flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
                      <div className="max-w-2xl">
                        <p className="text-xs font-medium text-sky-300 tracking-wide">
                          Executive Control Center · November 23, 2026
                        </p>
                        <h1 className="mt-2 text-2xl font-semibold text-white tracking-tight sm:text-3xl text-balance">
                          Welcome back, Elena. All global clusters are operating
                          within target latency.
                        </h1>
                        <p className="mt-2 text-sm text-slate-400">
                          {deployments.filter((d) => d.status === 'Healthy').length}{' '}
                          of {deployments.length} production workloads healthy ·{' '}
                          {team.length} active operators across 4 availability
                          zones
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:items-end shrink-0">
                        {/* Timeframe Selector */}
                        <div
                          role="group"
                          aria-label="Dashboard timeframe"
                          className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 self-start xl:self-end"
                        >
                          {(['24h', '7d', '30d', '90d'] as TimeframeKey[]).map(
                            (tf) => (
                              <button
                                key={tf}
                                type="button"
                                onClick={() => setTimeframe(tf)}
                                className={`rounded-lg px-3 py-1.5 font-mono text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                                  timeframe === tf
                                    ? 'bg-sky-500/20 text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                                    : 'text-slate-400 hover:text-white'
                                }`}
                              >
                                {tf.toUpperCase()}
                              </button>
                            )
                          )}
                        </div>

                        {/* Quick-Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setDeployModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-[0_0_24px_-4px_rgba(56,189,248,0.55)] transition-all duration-150 hover:bg-sky-400 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            New Deployment
                          </button>

                          <button
                            type="button"
                            onClick={handleExportReport}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-slate-100 transition-colors hover:border-white/[0.2] hover:bg-white/[0.09] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          >
                            <Download className="h-3.5 w-3.5 text-sky-300" />
                            Export Report
                          </button>

                          <button
                            type="button"
                            onClick={() => setInviteModalOpen(true)}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-slate-100 transition-colors hover:border-white/[0.2] hover:bg-white/[0.09] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          >
                            <UserPlus className="h-3.5 w-3.5 text-indigo-300" />
                            Invite Member
                          </button>

                          <button
                            type="button"
                            onClick={() => setActiveSection('deployments')}
                            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.05] px-3.5 py-2 text-xs font-medium text-slate-100 transition-colors hover:border-white/[0.2] hover:bg-white/[0.09] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                          >
                            <Layers className="h-3.5 w-3.5 text-cyan-300" />
                            Manage Nodes
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Key Statistics Cards */}
                  <KpiStatsGrid
                    metrics={kpis}
                    tiltEnabled={preferences.tilt3D}
                    onSelectMetric={handleSelectKpiMetric}
                  />

                  {/* Interactive Charts Grid */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
                    <div className="lg:col-span-8">
                      <InteractiveAreaChart
                        data={chartData}
                        timeframe={timeframe}
                        tiltEnabled={preferences.tilt3D}
                        activeMetric={chartMetric}
                        onMetricChange={setChartMetric}
                      />
                    </div>
                    <div className="lg:col-span-4">
                      <RegionalDistributionChart
                        regions={regions}
                        tiltEnabled={preferences.tilt3D}
                      />
                    </div>
                  </div>

                  {/* Performance / Analytics & Recent Activity */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-stretch">
                    <div className="lg:col-span-5">
                      <PerformancePanel
                        tiltEnabled={preferences.tilt3D}
                        onDiagnosticsComplete={handleDiagnosticsComplete}
                      />
                    </div>
                    <div className="lg:col-span-7">
                      <RecentActivityPanel
                        activities={activities}
                        searchQuery={searchQuery}
                        tiltEnabled={preferences.tilt3D}
                        onInspectActivity={setInspectedActivity}
                        onViewAll={() => setActiveSection('activity')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'analytics' && (
                <AnalyticsView
                  chartData={chartData}
                  regions={regions}
                  timeframe={timeframe}
                  onTimeframeChange={setTimeframe}
                  activeMetric={chartMetric}
                  onMetricChange={setChartMetric}
                  tiltEnabled={preferences.tilt3D}
                  onDiagnosticsComplete={handleDiagnosticsComplete}
                />
              )}

              {activeSection === 'deployments' && (
                <DeploymentsView
                  deployments={deployments}
                  searchQuery={searchQuery}
                  tiltEnabled={preferences.tilt3D}
                  onNewDeployment={() => setDeployModalOpen(true)}
                  onRestartNode={handleRestartNode}
                />
              )}

              {activeSection === 'activity' && (
                <ActivityLogView
                  activities={activities}
                  searchQuery={searchQuery}
                  tiltEnabled={preferences.tilt3D}
                  onInspectActivity={setInspectedActivity}
                />
              )}

              {activeSection === 'team' && (
                <TeamView
                  members={team}
                  tiltEnabled={preferences.tilt3D}
                  onOpenInvite={() => setInviteModalOpen(true)}
                />
              )}

              {activeSection === 'settings' && (
                <SettingsView
                  preferences={preferences}
                  onUpdatePreference={handleUpdatePreference}
                  tiltEnabled={preferences.tilt3D}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Action Modals */}
      <NewDeploymentModal
        open={deployModalOpen}
        onClose={() => setDeployModalOpen(false)}
        onCreateDeployment={handleCreateDeployment}
      />
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvite={handleInviteMember}
      />
      <ActivityInspectorModal
        activity={inspectedActivity}
        onClose={() => setInspectedActivity(null)}
      />

      {/* Action Feedback Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-xl border border-sky-400/30 glass-surface-elevated px-4 py-3 text-xs font-medium text-slate-100 shadow-2xl"
          >
            <Sparkles className="h-4 w-4 text-sky-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
