"use client";

import { useState } from "react";
import type { RangeKey } from "@/lib/yahoo";

const RANGE_LABEL: Record<RangeKey, string> = {
  "1D": "1 day ago",
  "1W": "1 week ago",
  "1M": "1 month ago",
  "3M": "3 months ago",
  "6M": "6 months ago",
  "1Y": "1 year ago",
  "5Y": "5 years ago",
};

function inr(v: number) {
  return `\u20B9${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export default function ReturnsCalculator({
  changePct,
  range,
}: {
  changePct: number | null;
  range: RangeKey;
}) {
  const [amount, setAmount] = useState(10000);
  const pct = changePct ?? 0;
  const finalValue = amount * (1 + pct / 100);
  const profit = finalValue - amount;
  const up = profit >= 0;

  return (
    <div className="rounded-2xl border border-surface bg-surface/40 p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
        Returns calculator
      </h3>
      <p className="mt-1 text-xs text-muted-light">
        If you had invested this much {RANGE_LABEL[range]}\u2026
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-lg text-muted">&#x20B9;</span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-lg border border-surface bg-background px-3 py-2 font-mono text-lg text-foreground outline-none focus:border-accent"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[5000, 10000, 50000, 100000].map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className="rounded-full bg-surface px-2.5 py-1 text-xs text-muted hover:bg-surface-hover hover:text-foreground"
          >
            {inr(a)}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-background p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">Worth today</span>
          <span className="font-mono text-2xl font-bold text-foreground">{inr(finalValue)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-sm text-muted">
            {up ? "Profit" : "Loss"}
          </span>
          <span
            className={`font-mono font-semibold ${up ? "text-up" : "text-down"}`}
          >
            {up ? "+" : ""}
            {inr(profit)} ({pct >= 0 ? "+" : ""}
            {pct.toFixed(2)}%)
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-muted-light">
        Based on this index&apos;s actual {range} return &middot; past performance is
        not indicative of future results.
      </p>
    </div>
  );
}
