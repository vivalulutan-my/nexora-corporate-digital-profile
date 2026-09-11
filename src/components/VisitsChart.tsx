"use client";

import { useMemo, useState } from "react";

type Point = { date: string; count: number };

const WIDTH = 700;
const HEIGHT = 220;
const PAD = { top: 16, right: 16, bottom: 28, left: 36 };

/** Returns a clean, evenly-divisible axis step (1/2/5 * 10^n) for ~4 ticks. */
function niceStep(roughStep: number) {
  if (roughStep <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const steps = [1, 2, 5, 10];
  for (const s of steps) {
    if (roughStep <= s * magnitude) return s * magnitude;
  }
  return 10 * magnitude;
}

function formatDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export default function VisitsChart({ data }: { data: Point[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const step = useMemo(
    () => niceStep(Math.max(...data.map((d) => d.count), 1) / 4),
    [data]
  );
  const maxVal = step * 4;

  const stepX = data.length > 1 ? plotWidth / (data.length - 1) : 0;

  const points = data.map((d, i) => {
    const x = PAD.left + i * stepX;
    const y = PAD.top + plotHeight - (d.count / maxVal) * plotHeight;
    return { x, y, ...d };
  });

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath =
    points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${(
          PAD.top + plotHeight
        ).toFixed(1)} L ${points[0].x.toFixed(1)} ${(
          PAD.top + plotHeight
        ).toFixed(1)} Z`
      : "";

  const yTicks = [0, 1, 2, 3, 4].map((n) => n * step);

  // show at most ~6 x-axis labels, evenly spaced
  const labelEvery = Math.max(1, Math.ceil(data.length / 6));

  function handleMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const idx = Math.round((relX - PAD.left) / (stepX || 1));
    setHoverIndex(Math.min(Math.max(idx, 0), data.length - 1));
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null;

  return (
    <div className="viz-root relative w-full">
      <style>{`
        .viz-root {
          --surface-1: #ffffff;
          --text-secondary: #52514e;
          --text-muted: #898781;
          --gridline: #e1e0d9;
          --baseline: #c3c2b7;
          --series-1: #2a78d6;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .viz-root {
            --surface-1: #1a1a19;
            --text-secondary: #c3c2b7;
            --text-muted: #898781;
            --gridline: #2c2c2a;
            --baseline: #383835;
            --series-1: #3987e5;
          }
        }
        :root[data-theme="dark"] .viz-root {
          --surface-1: #1a1a19;
          --text-secondary: #c3c2b7;
          --text-muted: #898781;
          --gridline: #2c2c2a;
          --baseline: #383835;
          --series-1: #3987e5;
        }
      `}</style>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Card views over time"
      >
        {yTicks.map((tick, i) => {
          const y = PAD.top + plotHeight - (tick / maxVal) * plotHeight;
          return (
            <g key={i}>
              <line
                x1={PAD.left}
                x2={WIDTH - PAD.right}
                y1={y}
                y2={y}
                stroke="var(--gridline)"
                strokeWidth={1}
              />
              <text
                x={PAD.left - 8}
                y={y + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--text-muted)"
              >
                {tick}
              </text>
            </g>
          );
        })}

        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={PAD.top + plotHeight}
          y2={PAD.top + plotHeight}
          stroke="var(--baseline)"
          strokeWidth={1}
        />

        {points.map(
          (p, i) =>
            i % labelEvery === 0 && (
              <text
                key={i}
                x={p.x}
                y={HEIGHT - 6}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-muted)"
              >
                {formatDateLabel(p.date)}
              </text>
            )
        )}

        {areaPath && (
          <path d={areaPath} fill="var(--series-1)" opacity={0.1} stroke="none" />
        )}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--series-1)"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {points.length > 0 && (
          <>
            <circle
              cx={points[points.length - 1].x}
              cy={points[points.length - 1].y}
              r={4}
              fill="var(--series-1)"
              stroke="var(--surface-1)"
              strokeWidth={2}
            />
          </>
        )}

        {hovered && (
          <>
            <line
              x1={hovered.x}
              x2={hovered.x}
              y1={PAD.top}
              y2={PAD.top + plotHeight}
              stroke="var(--baseline)"
              strokeWidth={1}
            />
            <circle
              cx={hovered.x}
              cy={hovered.y}
              r={4}
              fill="var(--series-1)"
              stroke="var(--surface-1)"
              strokeWidth={2}
            />
          </>
        )}

        <rect
          x={PAD.left}
          y={PAD.top}
          width={plotWidth}
          height={plotHeight}
          fill="transparent"
          onPointerMove={handleMove}
          onPointerLeave={() => setHoverIndex(null)}
        />
      </svg>

      {hovered && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs shadow-md dark:border-zinc-800 dark:bg-zinc-900"
          style={{
            left: `${(hovered.x / WIDTH) * 100}%`,
            top: `${(hovered.y / HEIGHT) * 100 - 2}%`,
          }}
        >
          <div className="font-semibold text-zinc-900 dark:text-zinc-50">
            {hovered.count} views
          </div>
          <div className="text-zinc-500">{formatDateLabel(hovered.date)}</div>
        </div>
      )}
    </div>
  );
}
