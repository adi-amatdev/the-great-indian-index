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
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

/** "What if I'd invested ₹X at the start of this range?" */
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
      <h3 className="text-sm font-bold uppercase tracking-wide text-white/50">
        Returns calculator
      </h3>
      <p className="mt-1 text-xs text-white/40">
        If you had invested this much {RANGE_LABEL[range]}…
      </p>

      <div className="mt-4 flex items-center gap-2">
        <span className="text-lg text-white/60">₹</span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-lg border border-white/15 bg-black/30 px-3 py-2 font-mono text-lg outline-none focus:border-white/40"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {[5000, 10000, 50000, 100000].map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/70 hover:bg-white/20"
          >
            {inr(a)}
          </button>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-black/30 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-white/50">Worth today</span>
          <span className="font-mono text-2xl font-bold">{inr(finalValue)}</span>
        </div>
        <div className="mt-1 flex items-baseline justify-between">
          <span className="text-sm text-white/50">
            {up ? "Profit" : "Loss"}
          </span>
          <span
            className={`font-mono font-semibold ${up ? "text-green-300" : "text-red-300"}`}
          >
            {up ? "+" : ""}
            {inr(profit)} ({pct >= 0 ? "+" : ""}
            {pct.toFixed(2)}%)
          </span>
        </div>
      </div>
      <p className="mt-2 text-center text-[11px] text-white/35">
        Based on this index&apos;s actual {range} return · past performance is
        not indicative of future results.
      </p>
    </div>
  );
}
