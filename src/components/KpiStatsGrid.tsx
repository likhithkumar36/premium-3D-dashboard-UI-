import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import type { KpiMetric } from '../types/dashboard';
import { AnimatedNumber } from './AnimatedNumber';
import { TiltCard } from './TiltCard';

interface KpiStatsGridProps {
  metrics: KpiMetric[];
  tiltEnabled: boolean;
  onSelectMetric?: (metricId: string) => void;
}

function MiniSparkline({
  data,
  color,
  id,
}: {
  data: number[];
  color: string;
  id: string;
}) {
  const width = 96;
  const height = 34;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(' ');

  const areaPath = `${linePath} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-9 w-24 overflow-visible shrink-0"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#spark-${id})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="2.6"
        fill={color}
      />
    </svg>
  );
}

export function KpiStatsGrid({
  metrics,
  tiltEnabled,
  onSelectMetric,
}: KpiStatsGridProps) {
  return (
    <section aria-label="Key Performance Indicators">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, idx) => {
          const isFavorable = metric.positiveIsGood
            ? metric.delta >= 0
            : metric.delta <= 0;
          const accentColor =
            idx === 1 ? '#818cf8' : idx === 3 ? '#22d3ee' : '#38bdf8';

          return (
            <TiltCard
              key={metric.id}
              tiltEnabled={tiltEnabled}
              glowAccent={idx === 1 ? 'indigo' : 'sky'}
              onClick={
                onSelectMetric ? () => onSelectMetric(metric.id) : undefined
              }
              className="p-5 sm:p-6"
            >
              <div className="flex flex-col justify-between gap-4 h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400 tracking-wide">
                      {metric.label}
                    </p>
                    <div className="mt-2 text-2xl font-semibold text-white sm:text-[26px] leading-tight">
                      <AnimatedNumber
                        value={metric.value}
                        prefix={metric.prefix}
                        suffix={metric.suffix}
                        decimals={metric.decimals}
                      />
                    </div>
                  </div>
                  <MiniSparkline
                    data={metric.sparkline}
                    color={accentColor}
                    id={metric.id}
                  />
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-white/[0.06] pt-3 text-xs">
                  <span
                    className={`inline-flex items-center gap-1 font-mono font-medium tabular-nums ${
                      isFavorable ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {metric.delta >= 0 ? (
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ArrowDownRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    {metric.delta > 0 ? `+${metric.delta}%` : `${metric.delta}%`}
                  </span>
                  <span className="truncate text-slate-400">
                    {metric.context}
                  </span>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}
