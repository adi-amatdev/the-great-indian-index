"use client";

import { useMemo, useState } from "react";
import type { RangeKey, SeriesPoint } from "@/lib/yahoo";

function fmtDate(t: number, range: RangeKey) {
  const d = new Date(t * 1000);
  if (range === "1D" || range === "1W") {
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function IndexChart({
  points,
  range,
  changePct,
}: {
  points: SeriesPoint[];
  range: RangeKey;
  changePct: number | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const up = (changePct ?? 0) >= 0;
  const lineColor = up ? "#588157" : "#a63d40";

  const geom = useMemo(() => {
    const W = 900;
    const H = 340;
    const pad = { l: 10, r: 14, t: 18, b: 28 };
    if (points.length < 2) return null;
    const vals = points.map((p) => p.v);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const span = max - min || 1;
    const x = (i: number) =>
      pad.l + (i / (points.length - 1)) * (W - pad.l - pad.r);
    const y = (v: number) =>
      pad.t + (1 - (v - min) / span) * (H - pad.t - pad.b);
    const line = points
      .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(2)},${y(p.v).toFixed(2)}`)
      .join(" ");
    const area = `${line} L${x(points.length - 1).toFixed(2)},${H - pad.b} L${x(
      0,
    ).toFixed(2)},${H - pad.b} Z`;
    // Value at each gridline (for the right-edge axis labels).
    const gridVals = [0.25, 0.5, 0.75].map((f) => max - f * span);
    const first = points[0].v;
    const last = points[points.length - 1].v;
    return { W, H, pad, x, y, line, area, gridVals, first, last, min, max };
  }, [points]);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!geom || points.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    const i = Math.round(rel * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  }

  const hovered = hover != null ? points[hover] : null;
  const hoverFrac =
    geom && hovered
      ? (geom.x(hover!) - geom.pad.l) / (geom.W - geom.pad.l - geom.pad.r)
      : 0;
  const tooltipX =
    hoverFrac < 0.2
      ? "translate(0,0)"
      : hoverFrac > 0.8
        ? "translate(-100%,0)"
        : "translate(-50%,0)";

  if (!geom) {
    return (
      <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-surface text-sm text-muted">
        No data available for this range.
      </div>
    );
  }

  const showBaseline = geom.min <= 100 && geom.max >= 100;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-surface bg-background">
      <svg
        viewBox={`0 0 ${geom.W} ${geom.H}`}
        className="w-full touch-none"
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
        role="img"
        aria-label={`Chart of the ${range} index performance`}
      >
        <defs>
          <linearGradient id="chartfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines with value labels on the right edge */}
        {[0.25, 0.5, 0.75].map((f, i) => {
          const gy = geom.pad.t + f * (geom.H - geom.pad.t - geom.pad.b);
          return (
            <g key={f}>
              <line
                x1={geom.pad.l}
                x2={geom.W - geom.pad.r}
                y1={gy}
                y2={gy}
                stroke="#2E2E2E"
                strokeOpacity="0.07"
                strokeWidth="1"
              />
              <text
                x={geom.W - geom.pad.r + 4}
                y={gy + 3}
                fontSize="10"
                fill="#8a7e75"
                fontFamily="var(--font-geist-mono), monospace"
              >
                {geom.gridVals[i].toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Rebase reference line at 100 */}
        {showBaseline && (
          <g>
            <line
              x1={geom.pad.l}
              x2={geom.W - geom.pad.r}
              y1={geom.y(100)}
              y2={geom.y(100)}
              stroke="#7D4047"
              strokeOpacity="0.35"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={geom.pad.l + 4}
              y={geom.y(100) - 5}
              fontSize="10"
              fill="#7D4047"
              fillOpacity="0.75"
              fontFamily="var(--font-geist-mono), monospace"
            >
              rebase 100
            </text>
          </g>
        )}

        <path d={geom.area} fill="url(#chartfill)" />
        <path
          d={geom.line}
          fill="none"
          stroke={lineColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* First-point anchor */}
        <circle cx={geom.x(0)} cy={geom.y(geom.first)} r="3" fill={lineColor} />
        {/* Last-point anchor + value tag */}
        <g>
          <circle
            cx={geom.x(points.length - 1)}
            cy={geom.y(geom.last)}
            r="4"
            fill={lineColor}
            stroke="#f1ece6"
            strokeWidth="2"
          />
          <text
            x={geom.x(points.length - 1) - 5}
            y={geom.y(geom.last) - 8}
            textAnchor="end"
            fontSize="11"
            fontWeight="700"
            fill={lineColor}
            fontFamily="var(--font-geist-mono), monospace"
          >
            {geom.last.toFixed(1)}
          </text>
        </g>

        {/* Crosshair */}
        {hovered && hover != null && (
          <>
            <line
              x1={geom.x(hover)}
              x2={geom.x(hover)}
              y1={geom.pad.t}
              y2={geom.H - geom.pad.b}
              stroke="#2E2E2E"
              strokeOpacity="0.22"
              strokeWidth="1"
            />
            <circle
              cx={geom.x(hover)}
              cy={geom.y(hovered.v)}
              r="4.5"
              fill={lineColor}
              stroke="#f1ece6"
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      {/* Follow-cursor tooltip */}
      {hovered && hover != null && geom && (
        <div
          className="pointer-events-none absolute top-3 z-10 rounded-lg border border-surface bg-background/95 px-3 py-1.5 shadow-lg shadow-black/10 backdrop-blur"
          style={{
            left: `${hoverFrac * 100}%`,
            transform: tooltipX,
          }}
        >
          <div className="font-mono text-sm font-bold tabular-nums text-foreground">
            {hovered.v.toFixed(2)}
            <span
              className={`ml-2 text-[11px] ${
                hovered.v >= geom.first ? "text-up" : "text-down"
              }`}
            >
              {hovered.v >= geom.first ? "+" : ""}
              {(((hovered.v - geom.first) / geom.first) * 100).toFixed(2)}%
            </span>
          </div>
          <div className="mt-0.5 text-[11px] tabular-nums text-muted">
            {fmtDate(hovered.t, range)}
          </div>
        </div>
      )}
    </div>
  );
}