import type { IndexDef } from "./indices";

export const BENCHMARKS: IndexDef[] = [
  { slug: "benchmark-nifty50", name: "NIFTY 50", tagline: "India's large-cap benchmark", blurb: "The NIFTY 50 benchmark for a broad large-cap comparison.", gradient: "from-slate-500 to-slate-800", accent: "#475569", thesis: "Benchmark", sources: [], constituents: [{ symbol: "^NSEI", name: "NIFTY 50" }] },
  { slug: "benchmark-nifty100", name: "NIFTY 100", tagline: "India's top 100 companies", blurb: "The NIFTY 100 benchmark for a wider large-cap comparison.", gradient: "from-slate-500 to-slate-800", accent: "#475569", thesis: "Benchmark", sources: [], constituents: [{ symbol: "^CNX100", name: "NIFTY 100" }] },
  { slug: "benchmark-nifty500", name: "NIFTY 500", tagline: "India's broad market benchmark", blurb: "The NIFTY 500 benchmark for broad market context.", gradient: "from-slate-500 to-slate-800", accent: "#475569", thesis: "Benchmark", sources: [], constituents: [{ symbol: "^CRSLDX", name: "NIFTY 500" }] },
];

export function getBenchmark(slug: string) {
  return BENCHMARKS.find((benchmark) => benchmark.slug === slug);
}
