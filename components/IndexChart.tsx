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
    const pad = { l: 8, r: 8, t: 16, b: 24 };
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
    return { W, H, pad, x, y, line, area };
  }, [points]);

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    if (!geom || points.length < 2) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const rel = (e.clientX - rect.left) / rect.width;
    const i = Math.round(rel * (points.length - 1));
    setHover(Math.max(0, Math.min(points.length - 1, i)));
  }

  const hovered = hover != null ? points[hover] : null;

  return (
    <div className="relative rounded-2xl border border-surface bg-background p-2">
      {geom ? (
        <svg
          viewBox={`0 0 ${geom.W} ${geom.H}`}
          className="w-full touch-none"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <defs>
            <linearGradient id="chartfill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={lineColor} stopOpacity="0.20" />
              <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0.25, 0.5, 0.75].map((f) => (
            <line
              key={f}
              x1={geom.pad.l}
              x2={geom.W - geom.pad.r}
              y1={geom.pad.t + f * (geom.H - geom.pad.t - geom.pad.b)}
              y2={geom.pad.t + f * (geom.H - geom.pad.t - geom.pad.b)}
              stroke="#2E2E2E"
              strokeOpacity="0.08"
              strokeWidth="1"
            />
          ))}

          <path d={geom.area} fill="url(#chartfill)" />
          <path
            d={geom.line}
            fill="none"
            stroke={lineColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {hovered && hover != null && (
            <>
              <line
                x1={geom.x(hover)}
                x2={geom.x(hover)}
                y1={geom.pad.t}
                y2={geom.H - geom.pad.b}
                stroke="#2E2E2E"
                strokeOpacity="0.2"
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
      ) : (
        <div className="flex h-[280px] items-center justify-center text-muted">
          No data available for this range.
        </div>
      )}

      {hovered && (
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-surface bg-background/90 px-3 py-1.5 text-xs backdrop-blur">
          <div className="font-mono text-sm font-bold text-foreground">
            {hovered.v.toFixed(2)}
          </div>
          <div className="text-muted">{fmtDate(hovered.t, range)}</div>
        </div>
      )}
    </div>
  );
}
