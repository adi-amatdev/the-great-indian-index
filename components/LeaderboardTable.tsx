"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { IndexData, RangeKey } from "@/lib/yahoo";
import Sparkline from "./Sparkline";
import PageHeader from "./ui/PageHeader";
import Segmented from "./ui/Segmented";
import ChangePill from "./ui/ChangePill";
import MarketStatus from "./MarketStatus";
import { ArrowRight } from "./ui/icons";

type Row = IndexData & {
  rank: number;
  custom?: boolean;
  creatorUsername?: string;
  risk: {
    volatility: number | null;
    sharpe: number | null;
    sortino: number | null;
    maxDrawdown: number | null;
  };
};

const PERIODS: { key: RangeKey; label: string }[] = [
  { key: "1D", label: "Day" },
  { key: "1W", label: "Week" },
  { key: "1M", label: "Month" },
  { key: "3M", label: "3 months" },
  { key: "6M", label: "6 months" },
  { key: "1Y", label: "Year" },
  { key: "5Y", label: "5 years" },
];

const RANK_STYLES = [
  "text-foreground bg-accent/15 text-accent",
  "text-foreground bg-surface",
  "text-foreground bg-surface",
];

export default function LeaderboardTable() {
  const [period, setPeriod] = useState<RangeKey>("1M");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<Row[]>([]);
  const [loadedPeriod, setLoadedPeriod] = useState<RangeKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/leaderboard?range=${period}&page=${page}&pageSize=12`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error("Leaderboard unavailable.");
        return r.json();
      })
      .then((d: { rows: Row[]; totalPages: number; total: number }) => {
        setRows(d.rows);
        setTotalPages(d.totalPages);
        setTotal(d.total);
        setError(null);
        setLoadedPeriod(period);
      })
      .catch((e: Error) => {
        if (e.name !== "AbortError") setError(e.message);
      });
    return () => controller.abort();
  }, [period, page]);

  const loading = loadedPeriod !== period;
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? rows.filter((row) => `${row.name} ${row.creatorUsername ?? ""}`.toLowerCase().includes(needle)) : rows;
  }, [rows, query]);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <PageHeader
        eyebrow="Market scoreboard"
        title="Leaders by return"
        description={
          <>
            Rankings are rebased over the same window. Sharpe and drawdown add
            the risk taken to get there.
            <span className="mt-3 flex items-center gap-2">
              <MarketStatus />
            </span>
          </>
        }
        aside={
          <Segmented<RangeKey>
            label="Leaderboard period"
            value={period}
            onChange={(next) => { setPeriod(next); setPage(1); }}
            options={PERIODS.map((p) => ({ value: p.key, label: p.label }))}
          />
        }
      />

      <div className="overflow-hidden rounded-2xl border border-surface bg-surface/40">
        <div className="flex justify-end border-b border-surface bg-background/50 px-4 py-3">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search indexes or creators…" aria-label="Search leaderboard" className="w-full rounded-lg border border-surface bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent sm:w-64" />
        </div>
        {loading ? (
          <div className="flex flex-col items-center gap-3 p-14 text-sm text-muted">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            Refreshing the board…
          </div>
        ) : error ? (
          <div role="alert" className="p-14 text-center text-sm font-semibold text-down">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-surface bg-background/50 font-mono text-[11px] uppercase tracking-wider text-muted-light">
                <tr>
                  <th className="px-4 py-3 font-semibold sm:px-5">#</th>
                  <th className="px-3 py-3 font-semibold">Index</th>
                  <th className="px-3 py-3 font-semibold">Path</th>
                  <th className="px-3 py-3 text-right font-semibold">Return</th>
                  <th className="hidden px-3 py-3 text-right font-semibold md:table-cell">
                    Sharpe
                  </th>
                  <th className="hidden px-3 py-3 text-right font-semibold lg:table-cell">
                    Volatility
                  </th>
                  <th className="hidden px-3 py-3 text-right font-semibold lg:table-cell">
                    Max drawdown
                  </th>
                  <th className="px-4 py-3 text-right font-semibold sm:px-5">Open</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => {
                  const up = (row.changePct ?? 0) >= 0;
                  return (
                    <tr
                      key={row.slug}
                      className="border-b border-surface/70 last:border-0 hover:bg-surface/30"
                    >
                      <td className="px-4 py-3 sm:px-5">
                        <span
                          className={`grid h-7 w-7 place-items-center rounded-lg font-mono text-xs font-black ${
                            RANK_STYLES[row.rank - 1] ?? "text-muted-light"
                          }`}
                        >
                          {String(row.rank).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-bold text-foreground">
                          {row.name}
                        </span>
                        {row.custom && (
                          <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent">
                            YOU
                          </span>
                        )}
                        {row.custom && row.creatorUsername && (
                          <Link
                            href={`/user/${row.creatorUsername}`}
                            className="mt-0.5 block text-[11px] text-muted transition hover:text-accent"
                          >
                            by @{row.creatorUsername}
                          </Link>
                        )}
                        {!row.custom && (
                          <span className="mt-0.5 block text-[11px] text-muted">by Bharat Indexes research desk</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="w-28">
                          <Sparkline
                            points={row.points}
                            color={up ? "#588157" : "#a63d40"}
                            width={112}
                            height={32}
                          />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <ChangePill value={row.changePct} />
                      </td>
                      <td className="hidden px-3 py-3 text-right font-mono tabular-nums text-muted md:table-cell">
                        {row.risk.sharpe?.toFixed(2) ?? "—"}
                      </td>
                      <td className="hidden px-3 py-3 text-right font-mono tabular-nums text-muted lg:table-cell">
                        {row.risk.volatility?.toFixed(2) ?? "—"}%
                      </td>
                      <td className="hidden px-3 py-3 text-right font-mono tabular-nums text-down lg:table-cell">
                        {row.risk.maxDrawdown?.toFixed(2) ?? "—"}%
                      </td>
                      <td className="px-4 py-3 text-right sm:px-5">
                        <Link
                          href={
                            row.custom
                              ? `/compare?left=${row.slug}`
                              : `/index/${row.slug}`
                          }
                          className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:gap-1.5"
                        >
                          View
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && !error && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-muted-light">
            Showing {(page - 1) * 12 + 1}–{Math.min(page * 12, total)} of {total} indexes
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
              className="rounded-full border border-surface px-3 py-1.5 text-xs font-bold text-muted transition hover:border-accent hover:text-foreground disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="rounded-full border border-surface px-3 py-1.5 text-xs font-bold text-muted transition hover:border-accent hover:text-foreground disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <p className="mt-5 text-xs leading-relaxed text-muted-light">
        Risk metrics use the available observations, annualized from their
        sampling interval. Sharpe assumes a 0% risk-free rate. Data via Yahoo
        Finance, delayed.
      </p>
    </main>
  );
}
