"use client";

import { useEffect, useRef, useState } from "react";
import type { IndexData, RangeKey, Weighting } from "@/lib/yahoo";
import IndexChart from "./IndexChart";
import ReturnsCalculator from "./ReturnsCalculator";
import TradePanel from "./TradePanel";
import { fmtLevel, fmtPct } from "@/lib/format";

const RANGE_KEYS: RangeKey[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];

export type Positions = {
  equal: { units: number; cost: number } | null;
  mcap: { units: number; cost: number } | null;
};

export default function IndexDashboard({
  slug,
  initial,
  loggedIn,
  cash,
  positions,
}: {
  slug: string;
  initial: IndexData;
  loggedIn: boolean;
  cash: number | null;
  positions: Positions;
}) {
  const [range, setRange] = useState<RangeKey>(initial.range);
  const [weighting, setWeighting] = useState<Weighting>(initial.weighting);
  const [data, setData] = useState<IndexData>(initial);
  const [loading, setLoading] = useState(false);
  const cache = useRef<Map<string, IndexData>>(
    new Map([[`${initial.range}:${initial.weighting}`, initial]]),
  );

  useEffect(() => {
    const key = `${range}:${weighting}`;
    if (cache.current.has(key)) {
      setData(cache.current.get(key)!);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetch(`/api/index/${slug}?range=${range}&weighting=${weighting}`)
      .then((r) => r.json())
      .then((d: IndexData) => {
        if (cancelled) return;
        cache.current.set(key, d);
        setData(d);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [range, weighting, slug]);

  const up = (data.changePct ?? 0) >= 0;

  return (
    <div>
      {/* Level + change */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="font-mono text-4xl font-black text-foreground">
            {fmtLevel(data.level)}
          </div>
          <div
            className={`mt-1 inline-flex rounded-full px-3 py-1 text-sm font-bold ${
              up ? "bg-up-bg text-up" : "bg-down-bg text-down"
            }`}
          >
            {up ? "\u25B2" : "\u25BC"} {fmtPct(data.changePct)} &middot; {range}
          </div>
        </div>

        {/* Weighting toggle */}
        <div className="inline-flex rounded-full border border-surface bg-background p-1 text-sm">
          {(["equal", "mcap"] as Weighting[]).map((w) => (
            <button
              key={w}
              onClick={() => setWeighting(w)}
              className={`rounded-full px-3 py-1 font-semibold transition ${
                weighting === w
                  ? "bg-accent text-white"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {w === "equal" ? "Equal weight" : "Market cap"}
            </button>
          ))}
        </div>
      </div>

      {/* Range toggle */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {RANGE_KEYS.map((k) => (
          <button
            key={k}
            onClick={() => setRange(k)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
              range === k
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {k}
          </button>
        ))}
        {loading && (
          <span className="ml-2 self-center text-xs text-muted">loading\u2026</span>
        )}
      </div>

      <IndexChart
        points={data.points}
        range={range}
        changePct={data.changePct}
      />
      <p className="mt-2 text-center text-xs text-muted">
        {weighting === "mcap" ? "Market-cap weighted" : "Equal weighted"} &middot;
        rebased to 100 at range start &middot; {data.ok}/{data.total} constituents live
      </p>

      {/* Calculator + trade */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <ReturnsCalculator changePct={data.changePct} range={range} />
        <TradePanel
          slug={slug}
          weighting={weighting}
          spot={data.spot}
          loggedIn={loggedIn}
          cash={cash}
          position={positions[weighting]}
        />
      </div>
    </div>
  );
}
