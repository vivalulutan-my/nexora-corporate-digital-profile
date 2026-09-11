"use client";

import { useMemo, useState } from "react";

type Bar = { label: string; count: number };

const WIDTH = 560;
const HEIGHT = 220;
const PAD = { top: 24, right: 12, bottom: 28, left: 12 };
const BAR_MAX_WIDTH = 24;

function niceStep(roughStep: number) {
  if (roughStep <= 0) return 1;
  const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
  const steps = [1, 2, 5, 10];
  for (const s of steps) {
    if (roughStep <= s * magnitude) return s * magnitude;
  }
  return 10 * magnitude;
}

export default function EventsBarChart({ data }: { data: Bar[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const plotWidth = WIDTH - PAD.left - PAD.right;
  const plotHeight = HEIGHT - PAD.top - PAD.bottom;

  const step = useMemo(
    () => niceStep(Math.max(...data.map((d) => d.count), 1) / 4),
    [data]
  );
  const maxVal = step * 4;

  const slotWidth = data.length > 0 ? plotWidth / data.length : plotWidth;
  const barWidth = Math.min(BAR_MAX_WIDTH, slotWidth * 0.5);

  const bars = data.map((d, i) => {
    const slotCenter = PAD.left + slotWidth * (i + 0.5);
    const barHeight = maxVal > 0 ? (d.count / maxVal) * plotHeight : 0;
    return {
      ...d,
      x: slotCenter - barWidth / 2,
      y: PAD.top + plotHeight - barHeight,
      width: barWidth,
      height: barHeight,
      centerX: slotCenter,
    };
  });

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
          --series-1-hover: #256abf;
        }
        @media (prefers-color-scheme: dark) {
          :root:not([data-theme="light"]) .viz-root {
            --surface-1: #1a1a19;
            --text-secondary: #c3c2b7;
            --text-muted: #898781;
            --gridline: #2c2c2a;
            --baseline: #383835;
            --series-1: #3987e5;
            --series-1-hover: #5598e7;
          }
        }
        :root[data-theme="dark"] .viz-root {
          --surface-1: #1a1a19;
          --text-secondary: #c3c2b7;
          --text-muted: #898781;
          --gridline: #2c2c2a;
          --baseline: #383835;
          --series-1: #3987e5;
          --series-1-hover: #5598e7;
        }
      `}</style>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full"
        role="img"
        aria-label="Events by type"
      >
        <line
          x1={PAD.left}
          x2={WIDTH - PAD.right}
          y1={PAD.top + plotHeight}
          y2={PAD.top + plotHeight}
          stroke="var(--baseline)"
          strokeWidth={1}
        />

        {bars.map((bar, i) => {
          const r = 4;
          const h = Math.max(bar.height, 0);
          const top = bar.y;
          const bottom = PAD.top + plotHeight;
          const path =
            h < r
              ? `M ${bar.x} ${bottom} L ${bar.x} ${top} L ${bar.x + bar.width} ${top} L ${bar.x + bar.width} ${bottom} Z`
              : `M ${bar.x} ${bottom}
                 L ${bar.x} ${top + r}
                 Q ${bar.x} ${top} ${bar.x + r} ${top}
                 L ${bar.x + bar.width - r} ${top}
                 Q ${bar.x + bar.width} ${top} ${bar.x + bar.width} ${top + r}
                 L ${bar.x + bar.width} ${bottom} Z`;

          return (
            <g
              key={bar.label}
              onPointerEnter={() => setHoverIndex(i)}
              onPointerLeave={() => setHoverIndex(null)}
              style={{ cursor: "default" }}
            >
              <rect
                x={PAD.left + slotWidth * i}
                y={PAD.top}
                width={slotWidth}
                height={plotHeight}
                fill="transparent"
              />
              <path
                d={path}
                fill={hoverIndex === i ? "var(--series-1-hover)" : "var(--series-1)"}
              />
              <text
                x={bar.centerX}
                y={top - 6}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="var(--text-secondary)"
              >
                {bar.count}
              </text>
              <text
                x={bar.centerX}
                y={HEIGHT - 8}
                textAnchor="middle"
                fontSize={10}
                fill="var(--text-muted)"
                className="capitalize"
              >
                {bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
