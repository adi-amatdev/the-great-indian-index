import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllPositions, getTrades } from "@/lib/portfolio";
import { getIndex } from "@/lib/indices";
import { getCustomIndexForUser } from "@/lib/custom-indexes";
import { getSpotPrice, Weighting } from "@/lib/yahoo";
import { logoutAction } from "@/app/actions";
import IndexIcon from "@/components/IndexIcon";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import ChangePill from "@/components/ui/ChangePill";
import { ArrowRight, LogOut } from "@/components/ui/icons";
import AccountDangerZone from "@/components/AccountDangerZone";

export const metadata = { title: "Portfolio - Bharat Indexes" };
export const dynamic = "force-dynamic";

function inr(v: number, dp = 0) {
  return `₹${v.toLocaleString("en-IN", { maximumFractionDigits: dp, minimumFractionDigits: dp })}`;
}

const WEIGHT_LABEL: Record<string, string> = {
  equal: "Equal",
  mcap: "M-cap",
  custom: "Custom",
};

function WeightChip({ weighting }: { weighting: string }) {
  return (
    <span className="inline-flex rounded-full border border-surface bg-background px-2 py-0.5 font-mono text-[11px] font-semibold text-muted">
      {WEIGHT_LABEL[weighting] ?? weighting}
    </span>
  );
}

export default async function PortfolioPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [positions, trades] = await Promise.all([
    getAllPositions(user.id),
    getTrades(user.id, 40),
  ]);

  const priced = await Promise.all(
    positions.map(async (p) => {
      const def = getIndex(p.slug) ?? (await getCustomIndexForUser(user.id, p.slug));
      const spot = def ? await getSpotPrice(def, p.weighting as Weighting) : null;
      const value = spot != null ? p.units * spot : 0;
      const pl = value - p.cost;
      return { p, def, spot, value, pl };
    }),
  );

  const holdingsValue = priced.reduce((s, x) => s + x.value, 0);
  const netWorth = user.cash + holdingsValue;
  const startWorth = 1_000_000;
  const overallPct = ((netWorth - startWorth) / startWorth) * 100;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <PageHeader
        eyebrow={`Paper trading · @${user.username}`}
        title="Portfolio"
        description="Net worth, holdings and trade history for your virtual account."
        aside={
          <form action={logoutAction}>
            <button className="inline-flex items-center gap-1.5 rounded-full border border-surface bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-foreground">
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </form>
        }
      />

      {/* Summary strip */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Net worth"
          value={inr(netWorth)}
          hint={`started with ${inr(startWorth)}`}
        />
        <StatCard label="Cash" value={inr(user.cash)} hint="available to invest" />
        <StatCard label="Holdings" value={inr(holdingsValue)} hint="marked at live unit price" />
        <StatCard
          label="Total return"
          value={`${overallPct >= 0 ? "+" : ""}${overallPct.toFixed(2)}%`}
          tone={overallPct >= 0 ? "up" : "down"}
          hint={`${overallPct >= 0 ? "+" : "−"}${inr(Math.abs(netWorth - startWorth))}`}
        />
      </section>

      {/* Holdings */}
      <section className="mt-8">
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">
            Holdings
            <span className="ml-2 text-sm font-normal text-muted-light">
              {priced.length} position{priced.length === 1 ? "" : "s"}
            </span>
          </h2>
          <span className="hidden font-mono text-[11px] text-muted-light sm:inline">
            live unit prices
          </span>
        </div>

        {priced.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface p-10 text-center">
            <p className="text-sm text-muted">
              No positions yet.{" "}
              <Link href="/" className="font-semibold text-accent hover:underline">
                Browse indexes
              </Link>{" "}
              and buy your first basket.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-surface bg-surface/40">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-surface bg-background/50 font-mono text-[11px] uppercase tracking-wider text-muted-light">
                  <tr>
                    <th className="px-4 py-3 font-semibold sm:px-5">Index</th>
                    <th className="px-3 py-3 font-semibold">Weighting</th>
                    <th className="hidden px-3 py-3 text-right font-semibold sm:table-cell">
                      Units
                    </th>
                    <th className="px-3 py-3 text-right font-semibold">Invested</th>
                    <th className="px-3 py-3 text-right font-semibold">Value</th>
                    <th className="px-4 py-3 text-right font-semibold sm:px-5">P/L</th>
                  </tr>
                </thead>
                <tbody>
                  {priced.map(({ p, def, value, pl }) => {
                    const plPct = p.cost > 0 ? (pl / p.cost) * 100 : 0;
                    return (
                      <tr
                        key={`${p.slug}-${p.weighting}`}
                        className="border-b border-surface/70 last:border-0 hover:bg-surface/30"
                      >
                        <td className="px-4 py-3 sm:px-5">
                          <Link
                            href={`/index/${p.slug}`}
                            className="group inline-flex items-center gap-2 font-semibold text-foreground"
                          >
                            {def && (
                              <IndexIcon slug={def.slug} className="h-4 w-4 text-accent" />
                            )}
                            <span className="group-hover:underline">
                              {def?.name ?? p.slug}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-light transition group-hover:text-accent" />
                          </Link>
                        </td>
                        <td className="px-3 py-3">
                          <WeightChip weighting={p.weighting} />
                        </td>
                        <td className="hidden px-3 py-3 text-right font-mono tabular-nums text-muted sm:table-cell">
                          {p.units.toFixed(4)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
                          {inr(p.cost)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
                          {inr(value)}
                        </td>
                        <td className="px-4 py-3 text-right sm:px-5">
                          <ChangePill
                            value={plPct}
                            suffix="%"
                          />
                          <div className="mt-0.5 font-mono text-[11px] tabular-nums text-muted">
                            {pl >= 0 ? "+" : ""}
                            {inr(pl)}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* Trade history */}
      {trades.length > 0 && (
        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground">
              Recent trades
              <span className="ml-2 text-sm font-normal text-muted-light">
                latest {trades.length}
              </span>
            </h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-surface bg-surface/40">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-sm">
                <thead className="border-b border-surface bg-background/50 font-mono text-[11px] uppercase tracking-wider text-muted-light">
                  <tr>
                    <th className="px-4 py-3 font-semibold sm:px-5">When</th>
                    <th className="px-3 py-3 font-semibold">Index</th>
                    <th className="px-3 py-3 font-semibold">Side</th>
                    <th className="hidden px-3 py-3 text-right font-semibold sm:table-cell">
                      Units
                    </th>
                    <th className="px-3 py-3 text-right font-semibold">Price</th>
                    <th className="px-4 py-3 text-right font-semibold sm:px-5">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t) => {
                    const def = getIndex(t.slug);
                    return (
                      <tr
                        key={Number(t.id)}
                        className="border-b border-surface/70 last:border-0 hover:bg-surface/30"
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs tabular-nums text-muted sm:px-5">
                          {new Date(Number(t.ts)).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="px-3 py-3">
                          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                            {def && (
                              <IndexIcon slug={def.slug} className="h-4 w-4 text-accent" />
                            )}
                            {def?.name ?? t.slug}
                          </span>
                          <span className="ml-1.5">
                            <WeightChip weighting={t.weighting} />
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold uppercase ${
                              t.side === "buy" ? "bg-up-bg text-up" : "bg-down-bg text-down"
                            }`}
                          >
                            {t.side}
                          </span>
                        </td>
                        <td className="hidden px-3 py-3 text-right font-mono tabular-nums text-muted sm:table-cell">
                          {t.units.toFixed(4)}
                        </td>
                        <td className="px-3 py-3 text-right font-mono tabular-nums text-foreground">
                          {inr(t.price, 2)}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold tabular-nums text-foreground sm:px-5">
                          {inr(t.amount, 2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      <section className="mt-8">
        <AccountDangerZone />
      </section>

      <footer className="mt-12 text-center text-xs text-muted-light">
        Paper money only · started with {inr(startWorth)} · not investment advice.
      </footer>
    </main>
  );
}
