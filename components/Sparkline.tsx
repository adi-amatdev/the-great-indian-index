import { SeriesPoint } from "@/lib/yahoo";

export default function Sparkline({
  points,
  color,
  width = 260,
  height = 64,
}: {
  points: SeriesPoint[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (points.length < 2) {
    return (
      <div
        className="flex items-center justify-center text-xs text-muted-light"
        style={{ width, height }}
      >
        no data
      </div>
    );
  }

  const vals = points.map((p) => p.v);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || 1;
  const pad = 4;

  const x = (i: number) =>
    pad + (i / (points.length - 1)) * (width - pad * 2);
  const y = (v: number) =>
    pad + (1 - (v - min) / span) * (height - pad * 2);

  const line = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(points.length - 1).toFixed(1)},${height - pad} L${x(
    0,
  ).toFixed(1)},${height - pad} Z`;

  const id = `spark-${color.replace("#", "")}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.30" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
