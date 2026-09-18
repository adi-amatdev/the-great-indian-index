"use client";

import { useEffect, useState } from "react";
import type { IndexDef } from "@/lib/indices";
import type { IndexData, RangeKey, Weighting } from "@/lib/yahoo";
import { fmtPct } from "@/lib/format";
import IndexChart from "./IndexChart";

type Risk = { volatility: number | null; sharpe: number | null; sortino: number | null; maxDrawdown: number | null };
type Result = IndexData & { risk: Risk };
type Payload = { left: Result; right: Result; benchmark: Result; range: RangeKey; weighting: Weighting };

const ranges: RangeKey[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];
const labels: Record<RangeKey, string> = { "1D": "Day", "1W": "Week", "1M": "Month", "3M": "3 months", "6M": "6 months", "1Y": "Year", "5Y": "5 years" };

function Metric({ label, value, suffix = "%" }: { label: string; value: number | null; suffix?: string }) {
  return <div className="rounded-xl bg-background/70 p-3"><div className="text-[11px] uppercase tracking-wider text-muted-light">{label}</div><div className="mt-1 font-mono text-sm font-bold text-foreground">{value == null ? "-" : `${value.toFixed(2)}${suffix}`}</div></div>;
}

function Pane({ side, result, selected, options, onChange }: { side: "left" | "right"; result: Result | null; selected: string; options: IndexDef[]; onChange: (value: string) => void }) {
  return <section className="min-w-0 bg-background/70 p-4 sm:p-6"><div className="mb-5 flex items-center gap-3"><span className="grid h-7 w-7 place-items-center rounded-lg bg-accent text-xs font-black text-white">{side === "left" ? "A" : "B"}</span><select value={selected} onChange={(e) => onChange(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-surface bg-background px-3 py-2 text-sm font-bold text-foreground outline-none focus:border-accent">{options.map((option) => <option key={option.slug} value={option.slug}>{option.name}</option>)}</select></div>{result ? <><div className="flex items-end justify-between gap-2"><div><p className="text-xs text-muted">{result.name}</p><p className="mt-1 font-mono text-3xl font-black text-foreground">{result.level?.toFixed(2) ?? "-"}</p></div><span className={`rounded-full px-2.5 py-1 text-sm font-bold ${(result.changePct ?? 0) >= 0 ? "bg-up-bg text-up" : "bg-down-bg text-down"}`}>{fmtPct(result.changePct)}</span></div><div className="mt-4"><IndexChart points={result.points} range={result.range} changePct={result.changePct} /></div><div className="mt-4 grid grid-cols-2 gap-2"><Metric label="Volatility" value={result.risk.volatility} /><Metric label="Sharpe" value={result.risk.sharpe} suffix="" /><Metric label="Sortino" value={result.risk.sortino} suffix="" /><Metric label="Max drawdown" value={result.risk.maxDrawdown} /></div></> : <div className="flex min-h-[28rem] items-center justify-center text-sm text-muted">Choose an index to load this pane.</div>}</section>;
}

export default function ComparisonWorkspace({ options, initialLeft = "tata", initialRight = "benchmark-nifty50" }: { options: IndexDef[]; initialLeft?: string; initialRight?: string }) {
  const [left, setLeft] = useState(initialLeft);
  const [right, setRight] = useState(initialRight);
  const [range, setRange] = useState<RangeKey>("1M");
  const [benchmark, setBenchmark] = useState("benchmark-nifty50");
  const [weighting, setWeighting] = useState<Weighting>("equal");
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/compare?left=${encodeURIComponent(left)}&right=${encodeURIComponent(right)}&benchmark=${benchmark}&range=${range}&weighting=${weighting}`, { signal: controller.signal })
      .then(async (response) => { if (!response.ok) throw new Error("Comparison data is unavailable right now."); return response.json(); })
      .then((data: Payload) => { setPayload(data); setError(null); setLoadedKey(`${left}:${right}:${benchmark}:${range}:${weighting}`); })
      .catch((reason: Error) => { if (reason.name !== "AbortError") setError(reason.message); })
      .finally(() => undefined);
    return () => controller.abort();
  }, [left, right, benchmark, range, weighting]);

  const requestKey = `${left}:${right}:${benchmark}:${range}:${weighting}`;
  const loading = loadedKey !== requestKey;
  const benchmarkResult = payload?.benchmark;
  return <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-5 sm:py-12"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Side-by-side research desk</p><h1 className="mt-2 text-4xl font-black tracking-tight text-foreground sm:text-5xl">Compare the story.</h1><p className="mt-3 max-w-2xl text-muted">Two indexes, one benchmark, identical windows. Risk metrics make the return earn its place.</p></div><div className="flex flex-wrap gap-1.5 rounded-2xl border border-surface bg-surface/40 p-1">{ranges.map((key) => <button key={key} onClick={() => setRange(key)} className={`rounded-xl px-3 py-2 text-xs font-bold transition ${range === key ? "bg-accent text-white" : "text-muted hover:text-foreground"}`}>{labels[key]}</button>)}</div></div>
    <div className="overflow-hidden rounded-2xl border border-surface bg-surface/50 shadow-xl shadow-black/5"><div className="flex items-center gap-2 border-b border-surface bg-[#2e2a29] px-3 py-2"><span className="h-2.5 w-2.5 rounded-full bg-[#e56b6f]" /><span className="h-2.5 w-2.5 rounded-full bg-[#e6b566]" /><span className="h-2.5 w-2.5 rounded-full bg-[#72b487]" /><div className="ml-3 flex min-w-0 flex-1 items-center gap-2 rounded-lg bg-[#46403e] px-3 py-1.5 text-xs text-[#d8d0ca]"><span className="text-[#9e958e]">⌕</span><span className="truncate">bharatindexes.local/compare</span></div><span className="hidden text-xs text-[#9e958e] sm:inline">⌁ research mode</span></div><div className="flex items-end gap-1 border-b border-surface bg-[#3a3533] px-2 pt-2"><div className="rounded-t-lg bg-background px-4 py-2 text-xs font-bold text-foreground">Compare — {labels[range]}</div><div className="rounded-t-lg px-4 py-2 text-xs text-[#b8aea6]">New split</div></div><div className="grid gap-px bg-surface md:grid-cols-2"><Pane side="left" result={payload?.left ?? null} selected={left} options={options} onChange={setLeft} /><Pane side="right" result={payload?.right ?? null} selected={right} options={options} onChange={setRight} /></div><div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface bg-surface/40 px-4 py-3 text-sm"><label className="flex items-center gap-2 text-muted">Benchmark<select value={benchmark} onChange={(e) => setBenchmark(e.target.value)} className="rounded-lg border border-surface bg-background px-2 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-accent"><option value="benchmark-nifty50">NIFTY 50</option><option value="benchmark-nifty100">NIFTY 100</option><option value="benchmark-nifty500">NIFTY 500</option></select></label><label className="flex items-center gap-2 text-muted">Weighting<select value={weighting} onChange={(e) => setWeighting(e.target.value as Weighting)} className="rounded-lg border border-surface bg-background px-2 py-1.5 text-xs font-semibold text-foreground outline-none focus:border-accent"><option value="equal">Equal weight</option><option value="mcap">Market cap</option><option value="custom">Custom weights</option></select></label>{loading && <span className="text-xs text-muted">Updating comparison...</span>}{error && <span role="alert" className="text-xs text-down">{error}</span>}</div></div>
    {benchmarkResult && <div className="mt-5 grid gap-3 rounded-2xl border border-surface bg-surface/40 p-5 sm:grid-cols-3"><div><p className="text-xs uppercase tracking-wider text-muted-light">Benchmark</p><p className="mt-1 font-bold text-foreground">{benchmarkResult.name}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-light">Index A vs benchmark</p><p className="mt-1 font-mono font-bold text-foreground">{fmtPct((payload?.left.changePct ?? 0) - (benchmarkResult.changePct ?? 0))}</p></div><div><p className="text-xs uppercase tracking-wider text-muted-light">Index B vs benchmark</p><p className="mt-1 font-mono font-bold text-foreground">{fmtPct((payload?.right.changePct ?? 0) - (benchmarkResult.changePct ?? 0))}</p></div></div>}
  </main>;
}
