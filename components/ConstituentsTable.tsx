"use client";

import { useEffect, useRef, useState } from "react";
import type { IndexData, RangeKey } from "@/lib/yahoo";
import { fmtPrice } from "@/lib/format";
import Segmented from "./ui/Segmented";
import ChangePill from "./ui/ChangePill";

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

  const live = sorted.filter((c) => c.price != null).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-surface bg-surface/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface bg-background/50 px-4 py-3">
        <Segmented<RangeKey>
          label="Performance window"
          value={range}
          onChange={setRange}
          options={RANGE_KEYS.map((key) => ({ value: key, label: key }))}
          size="sm"
        />
        <span className="inline-flex items-center gap-2 font-mono text-[11px] text-muted-light">
          {loading && (
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          )}
          {live}/{data.total} live · {range} move
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface/60 text-left">
            <tr className="font-mono text-[11px] uppercase tracking-wider text-muted-light">
              <th className="px-4 py-3 font-semibold sm:px-5">Company</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">Symbol</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold sm:px-5">{range} move</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((constituent) => (
              <tr
                key={constituent.symbol}
                className="border-t border-surface/80 transition hover:bg-surface/30"
              >
                <td className="px-4 py-3 sm:px-5">
                  <span className="block font-medium text-foreground">
                    {constituent.name}
                  </span>
                  <span className="mt-0.5 block font-mono text-[11px] text-muted-light sm:hidden">
                    {constituent.symbol.replace(".NS", "")}
                  </span>
                </td>
                <td className="hidden px-4 py-3 font-mono text-xs text-muted sm:table-cell">
                  {constituent.symbol.replace(".NS", "")}
                </td>
                <td className="px-4 py-3 text-right font-mono tabular-nums text-foreground">
                  {fmtPrice(constituent.price)}
                </td>
                <td className="px-4 py-3 text-right sm:px-5">
                  <ChangePill value={constituent.changePct} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}