'use client';

import { useState } from 'react';
import { chartLabels, chartValues } from '@/data/mock';
import { Card } from '@/components/Card';

const chartPoint = (value: number, index: number) => ({
  x: 24 + index * 64,
  y: 172 - value * 1.4,
});

const points = chartValues
  .map((value, index) => {
    const point = chartPoint(value, index);
    return `${point.x},${point.y}`;
  })
  .join(' ');

export function DashboardChart() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Card className="min-w-0 transition-shadow duration-300 hover:shadow-[0_14px_32px_rgba(0,35,71,0.1)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-habico-blue/55 text-xs font-normal tracking-[0.12em] uppercase">
            Huis in balans
          </p>
          <h2 className="text-habico-navy-dark mt-1 text-lg font-normal">
            Activiteit deze week
          </h2>
        </div>
        <span className="border-habico-grey/70 bg-habico-white text-habico-navy rounded-lg border px-3 py-2 text-[11px] font-semibold">
          Deze week <span className="text-habico-blue pl-2">⌄</span>
        </span>
      </div>
      <div className="mt-6 flex items-end gap-2">
        <span className="text-habico-navy-dark text-3xl font-bold ">78%</span>
        <span className="bg-tangy-blue/10 text-habico-blue mb-1 rounded-full px-2 py-1 text-[10px] font-bold">
          +8.4%
        </span>
        <span className="text-habico-blue/50 mb-1 text-[10px]">t.o.v. vorige week</span>
      </div>
      <div className="mt-4 w-full overflow-hidden">
        <svg
          aria-label="Grafiek van huishoudelijke activiteit door de week"
          className="h-[188px] w-full overflow-visible"
          viewBox="0 0 760 200"
          preserveAspectRatio="none"
          role="img"
        >
          {[32, 76, 120, 164].map((y) => (
            <line
              key={y}
              x1="20"
              x2="740"
              y1={y}
              y2={y}
              className="stroke-habico-grey/70"
              strokeDasharray="4 6"
            />
          ))}
          <polygon points={`24,172 ${points} 728,172`} className="fill-tangy-blue/5" />
          <polyline
            points={points}
            className="stroke-tangy-blue fill-none"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {chartValues.map((value, index) => (
            <g
              key={`${value}-${index}`}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              tabIndex={0}
              role="button"
              aria-label={`${chartLabels[index % chartLabels.length]}: ${value}% activiteit`}
            >
              {hoveredIndex === index && (
                <>
                  <line
                    x1={chartPoint(value, index).x}
                    x2={chartPoint(value, index).x}
                    y1={chartPoint(value, index).y + 8}
                    y2="172"
                    className="stroke-habico-orange/50"
                    strokeDasharray="3 4"
                  />
                  <rect
                    x={Math.min(Math.max(chartPoint(value, index).x - 27, 4), 709)}
                    y={Math.max(chartPoint(value, index).y - 38, 4)}
                    width="54"
                    height="24"
                    rx="8"
                    className="fill-habico-navy-dark"
                  />
                  <text
                    x={chartPoint(value, index).x}
                    y={Math.max(chartPoint(value, index).y - 22, 20)}
                    textAnchor="middle"
                    className="fill-habico-white text-[11px] font-bold"
                  >
                    {value}%
                  </text>
                </>
              )}
              <circle
                cx={chartPoint(value, index).x}
                cy={chartPoint(value, index).y}
                r={
                  hoveredIndex === index
                    ? 7
                    : index === chartValues.length - 1
                      ? 5
                      : 3.5
                }
                className={
                  hoveredIndex === index
                    ? 'fill-habico-orange stroke-habico-white'
                    : index === chartValues.length - 1
                      ? 'fill-habico-orange stroke-habico-white'
                      : 'fill-habico-white stroke-tangy-blue'
                }
                strokeWidth="2"
              />
            </g>
          ))}
        </svg>
        <div className="text-habico-blue/45 mt-1 flex justify-between px-1 text-[9px] font-bold">
          {chartLabels.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}
