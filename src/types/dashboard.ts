export type NavSection =
  | 'overview'
  | 'analytics'
  | 'deployments'
  | 'activity'
  | 'team'
  | 'settings';

export type TimeframeKey = '24h' | '7d' | '30d' | '90d';

export type ChartMetricKey = 'revenue' | 'throughput' | 'compute';

export type PerformanceTabKey = 'compute' | 'network' | 'storage';

export type ActivityCategory = 'all' | 'deployment' | 'security' | 'billing';

export interface KpiMetric {
  id: string;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta: number;
  deltaLabel: string;
  positiveIsGood: boolean;
  sparkline: number[];
  context: string;
}

export interface ChartPoint {
  label: string;
  revenue: number;
  revenuePrev: number;
  throughput: number;
  throughputPrev: number;
  compute: number;
  computePrev: number;
}

export interface RegionAllocation {
  id: string;
  name: string;
  location: string;
  share: number;
  requests: string;
  latency: string;
  color: string;
  glow: string;
}

export interface ProgressMetric {
  id: string;
  label: string;
  value: number;
  maxLabel: string;
  detail: string;
  accent: 'sky' | 'indigo' | 'emerald' | 'amber';
}

export interface ActivityItem {
  id: string;
  title: string;
  actor: string;
  category: Exclude<ActivityCategory, 'all'>;
  region: string;
  status: 'Completed' | 'Verified' | 'Warning' | 'In Progress';
  timestamp: string;
  summary: string;
  commitOrRef: string;
}

export interface DeploymentNode {
  id: string;
  service: string;
  environment: 'Production' | 'Staging' | 'Canary';
  region: string;
  version: string;
  status: 'Healthy' | 'Degraded' | 'Deploying';
  cpuLoad: number;
  memoryPct: number;
  uptime: string;
  lastUpdated: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  accessLevel: 'Owner' | 'Admin' | 'Operator' | 'Analyst';
  lastActive: string;
  avatarUrl?: string;
  initials: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  read: boolean;
  kind: 'info' | 'warning' | 'success';
}

export interface DashboardPreferences {
  tilt3D: boolean;
  ambientParticles: boolean;
  ambientGlow: boolean;
  compactDensity: boolean;
}
