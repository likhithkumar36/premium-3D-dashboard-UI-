import { useMemo, useState } from 'react';
import type { ChartMetricKey, ChartPoint, TimeframeKey } from '../types/dashboard';
import { TiltCard } from './TiltCard';

interface InteractiveAreaChartProps {
  data: ChartPoint[];
  timeframe: TimeframeKey;
  tiltEnabled: boolean;
  activeMetric: ChartMetricKey;
  onMetricChange: (metric: ChartMetricKey) => void;
}

const METRIC_META: Record<
  ChartMetricKey,
  {
    label: string;
    subtitle: string;
    color: string;
    gradientTop: string;
    formatValue: (v: number) => string;
  }
> = {
  revenue: {
    label: 'Revenue',
    subtitle: 'Gross metered revenue vs prior period',
    color: '#38bdf8',
    gradientTop: 'rgba(56, 189, 248, 0.34)',
    formatValue: (v) => `$${v.toLocaleString('en-US')}`,
  },
  throughput: {
    label: 'Throughput',
    subtitle: 'Millions of edge requests processed per interval',
    color: '#22d3ee',
    gradientTop: 'rgba(34, 211, 238, 0.32)',
    formatValue: (v) => `${v.toFixed(1)}M req`,
  },
  compute: {
    label: 'Compute Load',
    subtitle: 'Average cluster GPU utilization percentage',
    color: '#818cf8',
    gradientTop: 'rgba(129, 140, 248, 0.32)',
    formatValue: (v) => `${Math.round(v)}%`,
  },
};

function buildSmoothPath(points: Array<{ x: number; y: number }>): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? i : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return path;
}

export function InteractiveAreaChart({
  data,
  timeframe,
  tiltEnabled,
  activeMetric,
  onMetricChange,
}: InteractiveAreaChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const meta = METRIC_META[activeMetric];

  const width = 720;
  const height = 276;
  const padLeft = 56;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 34;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const { currentPoints, prevPoints, minY, maxY, yTicks } = useMemo(() => {
    const currVals = data.map((d) => d[activeMetric]);
    const prevKey =
      activeMetric === 'revenue'
        ? 'revenuePrev'
        : activeMetric === 'throughput'
          ? 'throughputPrev'
          : 'computePrev';
    const prevVals = data.map((d) => d[prevKey]);

    const allVals = [...currVals, ...prevVals];
    const rawMin = Math.min(...allVals);
    const rawMax = Math.max(...allVals);
    const margin = (rawMax - rawMin || 1) * 0.18;
    const lo = Math.max(0, rawMin - margin);
    const hi = rawMax + margin * 0.7;

    const toCoord = (val: number, idx: number) => {
      const x =
        padLeft + (data.length === 1 ? plotW / 2 : (idx / (data.length - 1)) * plotW);
      const y = padTop + (1 - (val - lo) / (hi - lo || 1)) * plotH;
      return { x, y, value: val, label: data[idx].label };
    };

    const curr = currVals.map(toCoord);
    const prev = prevVals.map(toCoord);

    const ticks = [0, 0.33, 0.66, 1].map((t) => {
      const val = lo + (hi - lo) * (1 - t);
      const y = padTop + t * plotH;
      return { val, y };
    });

    return {
      currentPoints: curr,
      prevPoints: prev,
      minY: lo,
      maxY: hi,
      yTicks: ticks,
    };
  }, [data, activeMetric, plotW, plotH]);

  const currentLine = useMemo(() => buildSmoothPath(currentPoints), [currentPoints]);
  const prevLine = useMemo(() => buildSmoothPath(prevPoints), [prevPoints]);
  const currentArea = useMemo(() => {
    if (currentPoints.length === 0) return '';
    const first = currentPoints[0];
    const last = currentPoints[currentPoints.length - 1];
    return `${currentLine} L ${last.x.toFixed(2)} ${(padTop + plotH).toFixed(2)} L ${first.x.toFixed(2)} ${(padTop + plotH).toFixed(2)} Z`;
  }, [currentLine, currentPoints, plotH]);

  const activeIndex = hoveredIndex ?? currentPoints.length - 1;
  const activePoint = currentPoints[activeIndex];
  const activePrevPoint = prevPoints[activeIndex];

  const pctDelta =
    activePoint && activePrevPoint && activePrevPoint.value > 0
      ? ((activePoint.value - activePrevPoint.value) / activePrevPoint.value) * 100
      : 0;

  const formatTick = (val: number) => {
    if (activeMetric === 'revenue') {
      return val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${Math.round(val)}`;
    }
    if (activeMetric === 'throughput') return `${val.toFixed(1)}M`;
    return `${Math.round(val)}%`;
  };

  return (
    <TiltCard
      tiltEnabled={tiltEnabled}
      maxTilt={2.2}
      glowAccent={activeMetric === 'compute' ? 'indigo' : 'sky'}
      className="p-6"
    >
      <div className="flex flex-col gap-5">
        {/* Header & Metric Switcher */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-semibold text-white tracking-tight">
                Telemetry Performance
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {timeframe.toUpperCase()} window
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">{meta.subtitle}</p>
          </div>

          <div
            role="tablist"
            aria-label="Chart metric selection"
            className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1 self-start sm:self-auto"
          >
            {(['revenue', 'throughput', 'compute'] as ChartMetricKey[]).map(
              (key) => {
                const selected = activeMetric === key;
                return (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={selected}
                    onClick={() => onMetricChange(key)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
                      selected
                        ? 'bg-sky-500/20 text-sky-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {METRIC_META[key].label}
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Focal Live Readout Strip */}
        {activePoint && activePrevPoint && (
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-y border-white/[0.06] py-3">
            <div className="flex flex-wrap items-baseline gap-4">
              <div>
                <span className="text-xs text-slate-400 mr-2">
                  {activePoint.label}
                </span>
                <span className="text-2xl font-semibold text-white font-mono tabular-nums">
                  {meta.formatValue(activePoint.value)}
                </span>
              </div>
              <span className="text-xs font-mono tabular-nums text-emerald-400">
                {pctDelta >= 0 ? '+' : ''}
                {pctDelta.toFixed(1)}% vs prior ({meta.formatValue(activePrevPoint.value)})
              </span>
            </div>

            <div className="flex items-center gap-5 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-0.5 w-4 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                Current period
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-0.5 w-4 border-t border-dashed border-slate-500" />
                Prior baseline
              </span>
            </div>
          </div>
        )}

        {/* Interactive SVG Chart */}
        <div className="relative w-full select-none">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible"
            onMouseLeave={() => setHoveredIndex(null)}
            role="img"
            aria-label={`${meta.label} trend chart`}
          >
            <defs>
              <linearGradient
                id={`areaGrad-${activeMetric}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={meta.gradientTop} />
                <stop offset="85%" stopColor="rgba(15, 23, 42, 0.02)" />
                <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
              </linearGradient>
              <filter id="lineGlow" x="-10%" y="-20%" width="120%" height="150%">
                <feDropShadow
                  dx="0"
                  dy="6"
                  stdDeviation="5"
                  floodColor={meta.color}
                  floodOpacity="0.45"
                />
              </filter>
            </defs>

            {/* Horizontal Gridlines & Y Axis Labels */}
            {yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={tick.y}
                  x2={width - padRight}
                  y2={tick.y}
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={tick.y + 4}
                  textAnchor="end"
                  className="fill-slate-500 text-[11px] font-mono tabular-nums"
                >
                  {formatTick(tick.val)}
                </text>
              </g>
            ))}

            {/* Prior Period Dashed Curve */}
            <path
              d={prevLine}
              fill="none"
              stroke="rgba(148, 163, 184, 0.32)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />

            {/* Main Gradient Area */}
            <path d={currentArea} fill={`url(#areaGrad-${activeMetric})`} />

            {/* Main 3D Glowing Curve */}
            <path
              d={currentLine}
              fill="none"
              stroke={meta.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#lineGlow)"
            />

            {/* X-Axis Labels */}
            {currentPoints.map((pt, i) => (
              <text
                key={pt.label}
                x={pt.x}
                y={height - 8}
                textAnchor="middle"
                className={`text-[11px] font-mono transition-colors ${
                  i === activeIndex ? 'fill-slate-200 font-medium' : 'fill-slate-500'
                }`}
              >
                {pt.label}
              </text>
            ))}

            {/* Active Hover Crosshair & Nodes */}
            {activePoint && activePrevPoint && (
              <g>
                <line
                  x1={activePoint.x}
                  y1={padTop}
                  x2={activePoint.x}
                  y2={padTop + plotH}
                  stroke="rgba(255, 255, 255, 0.16)"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <circle
                  cx={activePrevPoint.x}
                  cy={activePrevPoint.y}
                  r="3.5"
                  fill="#0f172a"
                  stroke="rgba(148,163,184,0.7)"
                  strokeWidth="1.5"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="9"
                  fill={meta.color}
                  fillOpacity="0.18"
                />
                <circle
                  cx={activePoint.x}
                  cy={activePoint.y}
                  r="4.5"
                  fill="#06070b"
                  stroke={meta.color}
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* Invisible Hover Hit Zones for Smooth 60fps Scrubber */}
            {currentPoints.map((pt, i) => {
              const step = plotW / Math.max(currentPoints.length - 1, 1);
              return (
                <rect
                  key={`hit-${pt.label}`}
                  x={pt.x - step / 2}
                  y={padTop}
                  width={step}
                  height={plotH + 16}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoveredIndex(i)}
                  onFocus={() => setHoveredIndex(i)}
                />
              );
            })}
          </svg>
        </div>
      </div>
    </TiltCard>
  );
}
