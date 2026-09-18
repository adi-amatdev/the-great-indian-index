import type { IndexData, SeriesPoint } from "./yahoo";

export type RiskMetrics = {
  volatility: number | null;
  sharpe: number | null;
  sortino: number | null;
  maxDrawdown: number | null;
};

function returns(points: SeriesPoint[]) {
  const out: number[] = [];
  for (let i = 1; i < points.length; i++) {
    const previous = points[i - 1].v;
    if (previous > 0) out.push(points[i].v / previous - 1);
  }
  return out;
}

export function riskMetrics(points: SeriesPoint[]): RiskMetrics {
  const daily = returns(points);
  if (daily.length < 2) return { volatility: null, sharpe: null, sortino: null, maxDrawdown: null };
  const gaps = points.slice(1).map((point, index) => point.t - points[index].t).filter((gap) => gap > 0).sort((a, b) => a - b);
  const medianGap = gaps[Math.floor(gaps.length / 2)] ?? 86_400;
  const periodsPerYear = Math.max(1, 31_536_000 / medianGap);
  const mean = daily.reduce((sum, value) => sum + value, 0) / daily.length;
  const variance = daily.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (daily.length - 1);
  const volatility = Math.sqrt(variance) * Math.sqrt(periodsPerYear) * 100;
  const downside = daily.filter((value) => value < 0);
  const downsideDeviation = downside.length ? Math.sqrt(downside.reduce((sum, value) => sum + value ** 2, 0) / downside.length) * Math.sqrt(periodsPerYear) : 0;
  const annualizedReturn = mean * periodsPerYear;
  let peak = points[0]?.v ?? 0;
  let maxDrawdown = 0;
  for (const point of points) {
    peak = Math.max(peak, point.v);
    if (peak > 0) maxDrawdown = Math.min(maxDrawdown, (point.v / peak - 1) * 100);
  }
  return {
    volatility,
    sharpe: volatility ? (annualizedReturn / (volatility / 100)) : null,
    sortino: downsideDeviation ? annualizedReturn / downsideDeviation : null,
    maxDrawdown,
  };
}

export function withRisk(data: IndexData) {
  return { ...data, risk: riskMetrics(data.points) };
}
