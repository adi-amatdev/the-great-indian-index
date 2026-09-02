"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Weighting } from "@/lib/yahoo";
import { buyIndex, sellIndex } from "@/app/actions";

function inr(v: number, dp = 2) {
  return `\u20B9${v.toLocaleString("en-IN", { maximumFractionDigits: dp, minimumFractionDigits: dp })}`;
}

export default function TradePanel({
  slug,
  weighting,
  spot,
  loggedIn,
  cash,
  position,
}: {
  slug: string;
  weighting: Weighting;
  spot: number | null;
  loggedIn: boolean;
  cash: number | null;
  position: { units: number; cost: number } | null;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [amount, setAmount] = useState(10000);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const units = position?.units ?? 0;
  const value = spot != null ? units * spot : 0;
  const cost = position?.cost ?? 0;
  const pl = value - cost;
  const plPct = cost > 0 ? (pl / cost) * 100 : 0;

  if (!loggedIn) {
    return (
      <div className="rounded-2xl border border-surface bg-surface/40 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
          Paper trading
        </h3>
        <p className="mt-2 text-sm text-muted">
          Practise investing with{" "}
          <span className="font-semibold text-foreground">&#x20B9;10,00,000</span> of virtual
          money, no real cash, no risk.
        </p>
        <Link
          href={`/login?next=/index/${slug}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-accent-hover"
        >
          Log in to trade
        </Link>
      </div>
    );
  }

  function trade(side: "buy" | "sell") {
    setMsg(null);
    start(async () => {
      const res =
        side === "buy"
          ? await buyIndex(slug, weighting, amount)
          : await sellIndex(slug, weighting, spot ? amount / spot : 0);
      if (res.ok) {
        setMsg({
          ok: true,
          text: side === "buy" ? "Bought!" : "Sold!",
        });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  const canSell = spot != null && units * spot >= amount - 1e-6;

  return (
    <div className="rounded-2xl border border-surface bg-surface/40 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-wide text-muted">
          Paper trading
        </h3>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] uppercase text-muted">
          {weighting === "mcap" ? "Market cap" : "Equal wt"}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-background px-3 py-2">
          <div className="text-muted">Cash</div>
          <div className="font-mono font-semibold text-foreground">
            {cash != null ? inr(cash, 0) : "-"}
          </div>
        </div>
        <div className="rounded-lg bg-background px-3 py-2">
          <div className="text-muted">Unit price</div>
          <div className="font-mono font-semibold text-foreground">
            {spot != null ? inr(spot) : "-"}
          </div>
        </div>
      </div>

      {units > 0.0000001 && (
        <div className="mt-2 rounded-lg bg-background px-3 py-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Your position</span>
            <span className="font-mono text-foreground">{units.toFixed(4)} units</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Value</span>
            <span className="font-mono font-semibold text-foreground">{inr(value, 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">P/L</span>
            <span
              className={`font-mono font-semibold ${pl >= 0 ? "text-up" : "text-down"}`}
            >
              {pl >= 0 ? "+" : ""}
              {inr(pl, 0)} ({plPct >= 0 ? "+" : ""}
              {plPct.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="text-muted">&#x20B9;</span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          className="w-full rounded-lg border border-surface bg-background px-3 py-2 font-mono text-foreground outline-none focus:border-accent"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled={pending || spot == null || amount <= 0}
          onClick={() => trade("buy")}
          className="rounded-xl bg-up px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "\u2026" : "Buy"}
        </button>
        <button
          disabled={pending || spot == null || amount <= 0 || !canSell}
          onClick={() => trade("sell")}
          className="rounded-xl bg-down px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          title={!canSell ? "You don't hold enough to sell this amount" : ""}
        >
          {pending ? "\u2026" : "Sell \u20B9 worth"}
        </button>
      </div>

      {msg && (
        <p
          className={`mt-3 text-center text-sm ${msg.ok ? "text-up" : "text-down"}`}
        >
          {msg.text}
        </p>
      )}
      <p className="mt-2 text-center text-[11px] text-muted-light">
        Buy/sell in rupee amounts at the live basket unit price. Positions are
        tracked separately per weighting method.
      </p>
    </div>
  );
}
