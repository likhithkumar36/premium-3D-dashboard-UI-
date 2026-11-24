import { useState } from 'react';
import type { RegionAllocation } from '../types/dashboard';
import { TiltCard } from './TiltCard';

interface RegionalDistributionChartProps {
  regions: RegionAllocation[];
  tiltEnabled: boolean;
}

export function RegionalDistributionChart({
  regions,
  tiltEnabled,
}: RegionalDistributionChartProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const activeRegion =
    regions.find((r) => r.id === selectedId) ?? regions[0] ?? null;

  const size = 188;
  const center = size / 2;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  let cumulativePct = 0;

  return (
    <TiltCard
      tiltEnabled={tiltEnabled}
      maxTilt={2.8}
      glowAccent="indigo"
      className="p-6 flex flex-col justify-between"
    >
      <div className="flex flex-col gap-5 h-full">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight">
            Regional Distribution
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Edge routing share and P95 latency by zone
          </p>
        </div>

        {/* 3D Layered Ring Visualization */}
        <div className="relative mx-auto flex items-center justify-center py-1">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="-rotate-90 overflow-visible"
            role="img"
            aria-label="Regional traffic share ring chart"
          >
            <defs>
              <filter id="ringShadow" x="-25%" y="-25%" width="150%" height="150%">
                <feDropShadow
                  dx="0"
                  dy="4"
                  stdDeviation="6"
                  floodColor="#38bdf8"
                  floodOpacity="0.22"
                />
              </filter>
            </defs>

            {/* Subtle 3D recessed track */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="14"
            />
            <circle
              cx={center}
              cy={center}
              r={radius - 13}
              fill="none"
              stroke="rgba(255,255,255,0.04)"
              strokeWidth="1"
            />

            {regions.map((region) => {
              const gap = 3.5;
              const segLen = Math.max(
                0,
                (region.share / 100) * circumference - gap
              );
              const offset = -(cumulativePct / 100) * circumference;
              cumulativePct += region.share;
              const isSelected = activeRegion?.id === region.id;

              return (
                <circle
                  key={region.id}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={region.color}
                  strokeWidth={isSelected ? 17 : 13}
                  strokeDasharray={`${segLen} ${circumference}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  filter={isSelected ? 'url(#ringShadow)' : undefined}
                  className="cursor-pointer transition-all duration-200"
                  style={{
                    opacity: selectedId && !isSelected ? 0.45 : 1,
                  }}
                  onMouseEnter={() => setSelectedId(region.id)}
                  onClick={() =>
                    setSelectedId((prev) =>
                      prev === region.id ? null : region.id
                    )
                  }
                />
              );
            })}
          </svg>

          {/* Center 3D Floating Readout */}
          {activeRegion && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-medium text-slate-400">
                {activeRegion.name}
              </span>
              <span className="mt-0.5 text-2xl font-semibold text-white font-mono tabular-nums">
                {activeRegion.share}%
              </span>
              <span className="mt-0.5 text-[11px] font-mono tabular-nums text-sky-300">
                {activeRegion.latency}
              </span>
            </div>
          )}
        </div>

        {/* Clean Unboxed Breakdown List */}
        <div className="divide-y divide-white/[0.06] border-t border-white/[0.06]">
          {regions.map((region) => {
            const isSelected = activeRegion?.id === region.id;
            return (
              <button
                key={region.id}
                type="button"
                onClick={() =>
                  setSelectedId((prev) =>
                    prev === region.id ? null : region.id
                  )
                }
                onMouseEnter={() => setSelectedId(region.id)}
                className={`flex w-full items-center justify-between py-2.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded ${
                  isSelected ? 'text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className="h-2.5 w-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: region.color }}
                  />
                  <span className="text-xs font-medium truncate">
                    {region.name}
                  </span>
                  <span className="text-xs text-slate-500 hidden sm:inline">
                    {region.location}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono tabular-nums shrink-0">
                  <span className="text-slate-400">{region.requests}</span>
                  <span className="w-9 text-right font-medium text-slate-100">
                    {region.share}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </TiltCard>
  );
}
