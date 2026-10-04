"use client";

import { useEffect, useRef, useState } from "react";
import type { IndexData, RangeKey, Weighting } from "@/lib/yahoo";
import IndexChart from "./IndexChart";
import ReturnsCalculator from "./ReturnsCalculator";
import TradePanel from "./TradePanel";
import Panel from "./ui/Panel";
import StatCard from "./ui/StatCard";
import Segmented from "./ui/Segmented";
import { fmtLevel } from "@/lib/format";
import { fmtISTDateTime } from "@/lib/market";
import MarketStatus, { useMarketStatus } from "./MarketStatus";
import { ArrowDown, ArrowUp } from "./ui/icons";
import { riskMetrics } from "@/lib/analytics";

const RANGE_KEYS: RangeKey[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];
const WEIGHT_LABEL: Record<string, string> = {
  equal: "Equal weight",
  mcap: "Market cap",
  custom: "Custom weights",
};

function inr(v: number | null, dp = 0) {
  if (v == null) return "-";
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: dp, minimumFractionDigits: dp })}`;
}

export type Positions = {
  equal: { units: number; cost: number } | null;
  mcap: { units: number; cost: number } | null;
  custom: { units: number; cost: number } | null;
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
  const market = useMarketStatus();
  const risk = riskMetrics(data.points);
  const weightOptions = (
    ["equal", "mcap", ...(initial.weighting === "custom" ? ["custom"] : [])] as Weighting[]
  ).map((w) => ({
    value: w,
    label: w === "equal" ? "Equal" : w === "mcap" ? "M-cap" : "Custom",
    title: WEIGHT_LABEL[w],
  }));

  return (
    <div className="space-y-4">
      {/* Stat strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={`Level · ${range}`}
          value={fmtLevel(data.level)}
          hint="rebased to 100 at range start"
        />
        <div className="relative overflow-hidden rounded-2xl border border-surface bg-surface/40 p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Range move
          </div>
          <div
            className={`mt-1.5 flex items-baseline gap-1.5 font-mono text-xl font-bold tabular-nums ${
              up ? "text-up" : "text-down"
            }`}
          >
            {up ? <ArrowUp className="h-4 w-4 self-center" /> : <ArrowDown className="h-4 w-4 self-center" />}
            {fmtLevel(data.changePct)}%
          </div>
          <div className="mt-0.5 truncate text-[11px] text-muted-light">
            {WEIGHT_LABEL[weighting]} · over {range}
          </div>
        </div>
        <StatCard
          label="Basket unit price"
          value={inr(data.spot)}
          hint="what a paper trade buys at"
        />
        <StatCard
          label="Live constituents"
          value={`${data.ok}/${data.total}`}
          tone={data.ok === data.total ? "up" : data.ok > 0 ? "accent" : "down"}
          hint={data.ok === data.total ? "all quotes streaming" : "some quotes delayed"}
        />
      </div>

      {/* Chart panel */}
      <Panel
        label="Price action"
        context={
          <span className="inline-flex items-center gap-3">
            <MarketStatus dot={false} />
            {loading && (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            )}
            <span>
              {range} · {WEIGHT_LABEL[weighting]}
            </span>
          </span>
        }
        bodyClassName="p-3 sm:p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <Segmented<Weighting>
            label="Weighting"
            value={weighting}
            onChange={setWeighting}
            options={weightOptions}
            size="sm"
          />
          <Segmented<RangeKey>
            label="Range"
            value={range}
            onChange={setRange}
            options={RANGE_KEYS.map((key) => ({ value: key, label: key }))}
            size="sm"
          />
        </div>

        <div className={`transition-opacity ${loading ? "opacity-60" : "opacity-100"}`}>
          <IndexChart
            points={data.points}
            range={range}
            changePct={data.changePct}
            asOf={data.asOf}
            marketOpen={market.open}
          />
        </div>

        <p className="mt-2 text-center font-mono text-[11px] text-muted-light">
          {WEIGHT_LABEL[weighting]} · rebased to 100 · {data.ok}/{data.total}{" "}
          constituents live
          {!market.open && data.asOf
            ? ` · no live points today · latest trading close ${fmtISTDateTime(data.asOf)}`
            : ""}
        </p>
      </Panel>

      <Panel label="Risk / return" context={`${range} window`}>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard
            label="Return"
            value={data.changePct == null ? "-" : `${data.changePct >= 0 ? "+" : ""}${data.changePct.toFixed(2)}%`}
            tone={data.changePct == null ? "plain" : data.changePct >= 0 ? "up" : "down"}
            hint={`observed over ${range}`}
          />
          <StatCard
            label="Annualized return"
            value={risk.annualizedReturn == null ? "-" : `${risk.annualizedReturn >= 0 ? "+" : ""}${risk.annualizedReturn.toFixed(2)}%`}
            tone={risk.annualizedReturn == null ? "plain" : risk.annualizedReturn >= 0 ? "up" : "down"}
            hint="annualized from observations"
          />
          <StatCard label="Volatility" value={risk.volatility == null ? "-" : `${risk.volatility.toFixed(2)}%`} hint="annualized variability" />
          <StatCard label="Sharpe" value={risk.sharpe?.toFixed(2) ?? "-"} hint="return per risk unit" />
          <StatCard label="Max drawdown" value={risk.maxDrawdown == null ? "-" : `${risk.maxDrawdown.toFixed(2)}%`} tone={risk.maxDrawdown != null && risk.maxDrawdown < 0 ? "down" : "plain"} hint="peak-to-trough loss" />
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-muted-light">
          Metrics use the available chart observations. Sharpe assumes a 0% risk-free rate; they are research signals, not forecasts.
        </p>
      </Panel>

      {/* Calculator + trade */}
      <div className="grid gap-4 md:grid-cols-2">
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
