"use client";

import { useEffect, useRef, useState } from "react";
import type { IndexData, RangeKey } from "@/lib/yahoo";
import { fmtPct, fmtPrice } from "@/lib/format";

const RANGE_KEYS: RangeKey[] = ["1D", "1W", "1M", "3M", "6M", "1Y", "5Y"];

export default function ConstituentsTable({
  slug,
  initial,
}: {
  slug: string;
  initial: IndexData;
}) {
  const [range, setRange] = useState<RangeKey>(initial.range);
  const [data, setData] = useState<IndexData>(initial);
  const [loading, setLoading] = useState(false);
  const cache = useRef<Map<RangeKey, IndexData>>(new Map([[initial.range, initial]]));

  useEffect(() => {
    if (cache.current.has(range)) {
      setData(cache.current.get(range)!);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fetch(`/api/index/${slug}?range=${range}&weighting=equal`)
      .then((response) => response.json())
      .then((nextData: IndexData) => {
        if (cancelled) return;
        cache.current.set(range, nextData);
        setData(nextData);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [range, slug]);

  const sorted = [...data.constituents].sort((a, b) => {
    if (a.price == null && b.price == null) return 0;
    if (a.price == null) return 1;
    if (b.price == null) return -1;
    return (b.changePct ?? 0) - (a.changePct ?? 0);
  });

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {RANGE_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
              range === key
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {key}
          </button>
        ))}
        {loading && <span className="ml-2 text-xs text-muted">loading...</span>}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-surface">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Company</th>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 text-right font-medium">Price</th>
              <th className="px-4 py-3 text-right font-medium">{range}</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((constituent) => {
              const up = (constituent.changePct ?? 0) >= 0;
              return (
                <tr
                  key={constituent.symbol}
                  className="border-t border-surface transition hover:bg-surface/30"
                >
                  <td className="px-4 py-3 font-medium text-foreground">{constituent.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted">
                    {constituent.symbol.replace(".NS", "")}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-foreground">
                    {fmtPrice(constituent.price)}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-mono font-semibold ${
                      constituent.changePct == null
                        ? "text-muted-light"
                        : up
                          ? "text-up"
                          : "text-down"
                    }`}
                  >
                    {fmtPct(constituent.changePct)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
