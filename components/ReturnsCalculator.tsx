"use client";

import { useState } from "react";
import type { RangeKey } from "@/lib/yahoo";
import Panel from "./ui/Panel";

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
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
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
  const total = Math.max(amount, finalValue, 1);
  const valueW = Math.max(0, Math.min(100, (finalValue / total) * 100));
  const diffW = Math.min(100, (Math.abs(profit) / total) * 100);

  return (
    <Panel
      label="Returns calculator"
      context={`if invested ${RANGE_LABEL[range]}`}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-muted">₹</span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          aria-label="Amount invested"
          className="w-full rounded-xl border border-surface bg-background px-3 py-2.5 font-mono text-lg font-bold tabular-nums text-foreground outline-none transition focus:border-accent"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {[5000, 10000, 50000, 100000].map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`rounded-full px-3 py-1 font-mono text-xs font-semibold transition ${
              amount === a
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {inr(a)}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-surface bg-background p-4">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted">Worth today</span>
          <span className="font-mono text-2xl font-bold tabular-nums text-foreground">
            {inr(finalValue)}
          </span>
        </div>
        <div className="mt-1 flex items-baseline justify-between gap-3">
          <span className="text-sm text-muted">{up ? "Profit" : "Loss"}</span>
          <span
            className={`font-mono text-sm font-bold tabular-nums ${
              up ? "text-up" : "text-down"
            }`}
          >
            {up ? "+" : "−"}
            {inr(Math.abs(profit))} ({pct >= 0 ? "+" : ""}
            {pct.toFixed(2)}%)
          </span>
        </div>

        {/* Proportional invested-vs-result bar */}
        <div
          className="mt-3 flex h-2 w-full overflow-hidden rounded-full bg-surface/80"
          role="img"
          aria-label={`${inr(amount)} invested is now worth ${inr(finalValue)}`}
        >
          <div
            className="h-full bg-muted/40"
            style={{ width: `${Math.min(100, valueW)}%` }}
          />
          <div
            className={`h-full ${up ? "bg-up" : "bg-down"}`}
            style={{ width: `${diffW}%` }}
          />
        </div>
        <div className="mt-1.5 flex justify-between font-mono text-[10px] text-muted-light">
          <span>{inr(amount)} invested</span>
          <span>{up ? "+" : "−"}
            {inr(Math.abs(profit))} {up ? "gained" : "lost"}</span>
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-light">
        Based on this index&apos;s actual {range} return · past performance is
        not indicative of future results.
      </p>
    </Panel>
  );
}