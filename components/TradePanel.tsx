"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Weighting } from "@/lib/yahoo";
import { buyIndex, sellIndex } from "@/app/actions";
import Panel from "./ui/Panel";
import { ArrowRight } from "./ui/icons";

function inr(v: number, dp = 2) {
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: dp, minimumFractionDigits: dp })}`;
}

const WEIGHT_LABEL: Record<string, string> = {
  equal: "Equal wt",
  mcap: "Market cap",
  custom: "Custom weights",
};

const PRESETS = [5000, 10000, 50000, 100000];

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
      <Panel label="Paper trading" context="₹10,00,000 virtual money">
        <div className="flex min-h-36 flex-col items-center justify-center gap-3 text-center">
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            Practise investing with
            <span className="font-semibold text-foreground"> ₹10,00,000</span> of
            virtual money — no real cash, no risk.
          </p>
          <Link
            href={`/login?next=/index/${slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-hover"
          >
            Log in to trade
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Panel>
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
          text: side === "buy" ? "Bought — position updated." : "Sold — cash credited.",
        });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  const canSell = spot != null && units * spot >= amount - 1e-6;

  return (
    <Panel label="Paper trading" context={WEIGHT_LABEL[weighting] ?? weighting}>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-surface bg-background px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Cash
          </div>
          <div className="mt-0.5 font-mono text-base font-bold tabular-nums text-foreground">
            {cash != null ? inr(cash, 0) : "-"}
          </div>
        </div>
        <div className="rounded-xl border border-surface bg-background px-3 py-2.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Unit price
          </div>
          <div className="mt-0.5 font-mono text-base font-bold tabular-nums text-foreground">
            {spot != null ? inr(spot) : "-"}
          </div>
        </div>
      </div>

      {units > 0.0000001 && (
        <div className="mt-2 rounded-xl border border-surface bg-background px-3 py-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Your position</span>
            <span className="font-mono tabular-nums text-foreground">
              {units.toFixed(4)} units
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted">Value</span>
            <span className="font-mono font-semibold tabular-nums text-foreground">
              {inr(value, 0)}
            </span>
          </div>
          <div className="mt-1 flex justify-between">
            <span className="text-muted">P/L</span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                pl >= 0 ? "text-up" : "text-down"
              }`}
            >
              {pl >= 0 ? "+" : ""}
              {inr(pl, 0)} ({plPct >= 0 ? "+" : ""}
              {plPct.toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="text-lg font-semibold text-muted">₹</span>
        <input
          type="number"
          min={0}
          value={amount}
          onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
          aria-label="Trade amount"
          className="w-full rounded-xl border border-surface bg-background px-3 py-2.5 font-mono text-base font-bold tabular-nums text-foreground outline-none transition focus:border-accent"
        />
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {PRESETS.map((a) => (
          <button
            key={a}
            onClick={() => setAmount(a)}
            className={`rounded-full px-2.5 py-1 font-mono text-xs font-semibold transition ${
              amount === a
                ? "bg-accent text-white"
                : "bg-surface text-muted hover:bg-surface-hover hover:text-foreground"
            }`}
          >
            {a >= 100000 ? `${a / 100000}L` : `${a / 1000}K`}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          disabled={pending || spot == null || amount <= 0}
          onClick={() => trade("buy")}
          className="rounded-xl bg-up px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "…" : "Buy"}
        </button>
        <button
          disabled={pending || spot == null || amount <= 0 || !canSell}
          onClick={() => trade("sell")}
          title={!canSell ? "You don't hold enough to sell this amount" : undefined}
          className="rounded-xl bg-down px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "…" : "Sell"}
        </button>
      </div>

      {msg && (
        <p
          role="status"
          className={`mt-3 rounded-xl px-3 py-2 text-center text-sm font-semibold ${
            msg.ok ? "bg-up-bg text-up" : "bg-down-bg text-down"
          }`}
        >
          {msg.text}
        </p>
      )}
      <p className="mt-3 text-center text-[11px] text-muted-light">
        Buy/sell in rupee amounts at the live basket unit price. Positions are
        tracked separately per weighting method.
      </p>
    </Panel>
  );
}