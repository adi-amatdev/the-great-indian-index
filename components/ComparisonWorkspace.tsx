"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { IndexDef } from "@/lib/indices";
import type { IndexData, RangeKey, Weighting } from "@/lib/yahoo";
import { fmtPct } from "@/lib/format";
import { fmtISTDateTime } from "@/lib/market";
import IndexChart from "./IndexChart";
import MarketStatus, { useMarketStatus } from "./MarketStatus";
import Panel from "./ui/Panel";
import PageHeader from "./ui/PageHeader";
import Segmented from "./ui/Segmented";
import ChangePill from "./ui/ChangePill";
import StatCard from "./ui/StatCard";
import { GripDots, Search } from "./ui/icons";

type Risk = {
  volatility: number | null;
  sharpe: number | null;
  sortino: number | null;
  maxDrawdown: number | null;
};
type Result = IndexData & { risk: Risk };
type Payload = {
  left: Result;
  right: Result;
  benchmark: Result;
  range: RangeKey;
  weighting: Weighting;
};

const RANGES: RangeKey[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];
const RANGE_LABEL: Record<RangeKey, string> = {
  "1D": "Day",
  "1W": "Week",
  "1M": "Month",
  "3M": "3 months",
  "6M": "6 months",
  "1Y": "Year",
  "5Y": "5 years",
};

function useDebounced<T>(value: T, delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function SearchPicker({
  value,
  options,
  onSelect,
  label,
}: {
  value: string;
  options: IndexDef[];
  onSelect: (slug: string) => void;
  label: string;
}) {
  const selected = options.find((option) => option.slug === value);
  const [query, setQuery] = useState(selected?.name ?? "");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const debounced = useDebounced(query);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const matches = useMemo(
    () =>
      options
        .filter((option) =>
          `${option.name} ${option.slug} ${option.tagline}`
            .toLowerCase()
            .includes(debounced.trim().toLowerCase()),
        )
        .slice(0, 8),
    [options, debounced],
  );

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function select(slug: string) {
    const name = options.find((option) => option.slug === slug)?.name ?? "";
    setQuery(name);
    setOpen(false);
    onSelect(slug);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, Math.max(0, matches.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (matches[highlight]) select(matches[highlight].slug);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={rootRef} className="relative min-w-0 flex-1">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-light" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setHighlight(0);
          }}
          onFocus={() => {
            setOpen(true);
            setHighlight(0);
          }}
          onKeyDown={onKeyDown}
          aria-label={label}
          aria-expanded={open && Boolean(query)}
          aria-controls={open && query ? listboxId : undefined}
          role="combobox"
          aria-autocomplete="list"
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const slug = event.dataTransfer.getData("text/plain");
            if (slug) select(slug);
          }}
          placeholder="Search by name or ticker…"
          className="w-full rounded-xl border border-surface bg-background py-2.5 pl-9 pr-3 text-sm font-semibold text-foreground outline-none transition placeholder:font-normal placeholder:text-muted-light focus:border-accent"
        />
      </div>

      {open && query && (
        <div
          role="listbox"
          id={listboxId}
          className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-surface bg-background shadow-xl shadow-black/10"
        >
          {matches.length ? (
            matches.map((option, index) => (
              <button
                type="button"
                key={option.slug}
                role="option"
                aria-selected={index === highlight}
                draggable
                onDragStart={(event) =>
                  event.dataTransfer.setData("text/plain", option.slug)
                }
                onClick={() => select(option.slug)}
                onMouseEnter={() => setHighlight(index)}
                className={`flex w-full items-center justify-between gap-3 border-b border-surface/70 px-3 py-2.5 text-left last:border-0 ${
                  index === highlight ? "bg-surface/60" : "hover:bg-surface/40"
                }`}
              >
                <span className="min-w-0">
                  <strong className="block truncate text-sm text-foreground">
                    {option.name}
                  </strong>
                  <small className="block truncate text-xs text-muted">
                    {option.slug} · {option.tagline}
                  </small>
                </span>
                <span
                  title="Drag to the opposite pane"
                  className="cursor-grab text-muted-light active:cursor-grabbing"
                >
                  <GripDots className="h-4 w-4" />
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-sm text-muted">No matching indexes.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  suffix = "%",
}: {
  label: string;
  value: number | null;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-surface bg-background/60 px-3 py-2.5">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
        {label}
      </div>
      <div className="mt-0.5 font-mono text-sm font-bold tabular-nums text-foreground">
        {value == null ? "—" : `${value.toFixed(2)}${suffix}`}
      </div>
    </div>
  );
}

function Pane({
  side,
  result,
  selected,
  options,
  onChange,
  stale,
  marketOpen,
}: {
  side: "left" | "right";
  result: Result | null;
  selected: string;
  options: IndexDef[];
  onChange: (value: string) => void;
  stale: boolean;
  marketOpen: boolean;
}) {
  return (
    <section
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        const slug = event.dataTransfer.getData("text/plain");
        if (slug) onChange(slug);
      }}
      className="flex min-w-0 flex-col p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-accent font-mono text-xs font-black text-white">
          {side === "left" ? "A" : "B"}
        </span>
        <SearchPicker
          value={selected}
          options={options}
          onSelect={onChange}
          label={`Search index ${side}`}
        />
      </div>

      {result ? (
        <div
          className={`flex min-w-0 flex-1 flex-col transition-opacity duration-300 ${
            stale ? "opacity-50" : "opacity-100"
          }`}
        >
          <div className="flex items-end justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs text-muted">{result.name}</p>
              <p className="mt-1 font-mono text-3xl font-black tabular-nums text-foreground">
                {result.level?.toFixed(2) ?? "—"}
              </p>
            </div>
            <ChangePill value={result.changePct} />
          </div>

          <div className="mt-3 min-h-0">
            <IndexChart
              points={result.points}
              range={result.range}
              changePct={result.changePct}
              asOf={result.asOf}
              marketOpen={marketOpen}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <Metric label="Volatility" value={result.risk.volatility} />
            <Metric label="Sharpe" value={result.risk.sharpe} suffix="" />
            <Metric label="Sortino" value={result.risk.sortino} suffix="" />
            <Metric
              label="Max drawdown"
              value={result.risk.maxDrawdown}
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-72 flex-1 flex-col items-center justify-center gap-2 text-sm text-muted">
          <GripDots className="h-6 w-6 text-muted-light" />
          Drag an index here.
        </div>
      )}
    </section>
  );
}

export default function ComparisonWorkspace({
  options,
  initialLeft = "tata",
  initialRight = "benchmark-nifty50",
}: {
  options: IndexDef[];
  initialLeft?: string;
  initialRight?: string;
}) {
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
    fetch(
      `/api/compare?left=${encodeURIComponent(left)}&right=${encodeURIComponent(
        right,
      )}&benchmark=${benchmark}&range=${range}&weighting=${weighting}`,
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) throw new Error("Comparison data is unavailable right now.");
        return response.json();
      })
      .then((data: Payload) => {
        setPayload(data);
        setError(null);
        setLoadedKey(`${left}:${right}:${benchmark}:${range}:${weighting}`);
      })
      .catch((reason: Error) => {
        if (reason.name !== "AbortError") setError(reason.message);
      });
    return () => controller.abort();
  }, [left, right, benchmark, range, weighting]);

  const requestKey = `${left}:${right}:${benchmark}:${range}:${weighting}`;
  const loading = loadedKey !== requestKey;
  const customAvailable = Boolean(
    options.find((option) => option.slug === left)?.custom ||
      options.find((option) => option.slug === right)?.custom,
  );
  const benchmarkResult = payload?.benchmark;
  const market = useMarketStatus();
  const benchmarkOptions = options.filter((option) =>
    option.slug.startsWith("benchmark-"),
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-5 sm:py-12">
      <PageHeader
        eyebrow="Side-by-side research desk"
        title="Compare the story."
        description="Drag any index onto either side, or search by name and ticker. Both panes share the same window, weighting and benchmark."
        aside={
          <Segmented<RangeKey>
            label="Comparison window"
            value={range}
            onChange={setRange}
            options={RANGES.map((key) => ({ value: key, label: RANGE_LABEL[key] }))}
          />
        }
      />

      <Panel
        label="Comparison desk"
        context={
          payload ? (
            <span className="inline-flex items-center gap-3">
              <MarketStatus dot={false} />
              {payload.left.asOf
                ? `last ${fmtISTDateTime(payload.left.asOf)}`
                : ""}
            </span>
          ) : (
            "waiting on data…"
          )
        }
        bodyClassName="p-0 sm:p-0"
      >
        <div className="grid gap-px bg-surface md:grid-cols-2">
          <Pane
            side="left"
            result={payload?.left ?? null}
            selected={left}
            options={options}
            onChange={setLeft}
            stale={loading}
            marketOpen={market.open}
          />
          <Pane
            side="right"
            result={payload?.right ?? null}
            selected={right}
            options={options}
            onChange={setRight}
            stale={loading}
            marketOpen={market.open}
          />
        </div>

        {/* Controls + status strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-surface bg-background/50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-muted">
              Benchmark
              <select
                value={benchmark}
                onChange={(e) => setBenchmark(e.target.value)}
                className="rounded-lg border border-surface bg-background px-2.5 py-1.5 font-mono text-xs font-semibold text-foreground outline-none transition focus:border-accent"
              >
                {benchmarkOptions.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </label>
            <Segmented<Weighting>
              label="Weighting"
              value={weighting}
              onChange={setWeighting}
              size="sm"
              options={[
                { value: "equal", label: "Equal" },
                { value: "mcap", label: "Market cap" },
                {
                  value: "custom",
                  label: "Custom weights",
                  disabled: !customAvailable,
                  title: customAvailable ? undefined : "Only for saved custom indexes",
                },
              ]}
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            {loading && (
              <span className="inline-flex items-center gap-2 font-semibold text-muted">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Updating…
              </span>
            )}
            {error && (
              <span role="alert" className="font-semibold text-down">
                {error}
              </span>
            )}
          </div>
        </div>
      </Panel>

      {/* Benchmark vs each side */}
      {benchmarkResult && payload && (
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          <StatCard
            label="Benchmark"
            value={benchmarkResult.name}
            hint={`${benchmarkResult.changePct != null ? fmtPct(benchmarkResult.changePct) : "—"} over ${range}`}
          />
          <StatCard
            label="Index A vs benchmark"
            value={fmtPct((payload.left.changePct ?? 0) - (benchmarkResult.changePct ?? 0))}
            tone={(payload.left.changePct ?? 0) - (benchmarkResult.changePct ?? 0) >= 0 ? "up" : "down"}
            hint="beating / trailing the benchmark"
          />
          <StatCard
            label="Index B vs benchmark"
            value={fmtPct((payload.right.changePct ?? 0) - (benchmarkResult.changePct ?? 0))}
            tone={(payload.right.changePct ?? 0) - (benchmarkResult.changePct ?? 0) >= 0 ? "up" : "down"}
            hint="beating / trailing the benchmark"
          />
        </section>
      )}
    </main>
  );
}
