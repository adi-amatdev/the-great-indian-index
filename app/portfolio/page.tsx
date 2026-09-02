import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getAllPositions, getTrades } from "@/lib/portfolio";
import { getIndex } from "@/lib/indices";
import { getSpotPrice, Weighting } from "@/lib/yahoo";
import { logoutAction } from "@/app/actions";
import IndexIcon from "@/components/IndexIcon";

export const metadata = { title: "Portfolio - Bharat Indexes" };
export const dynamic = "force-dynamic";

function inr(v: number, dp = 0) {
  return `\u20B9${v.toLocaleString("en-IN", { maximumFractionDigits: dp, minimumFractionDigits: dp })}`;
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
      const def = getIndex(p.slug);
      const spot = def
        ? await getSpotPrice(def, p.weighting as Weighting)
        : null;
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
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">
            @{user.username}&apos;s portfolio
          </h1>
          <p className="text-sm text-muted">Paper trading account</p>
        </div>
        <form action={logoutAction}>
          <button className="rounded-full border border-surface bg-surface/50 px-4 py-2 text-sm text-muted transition hover:bg-surface-hover hover:text-foreground">
            Log out
          </button>
        </form>
      </div>

      {/* Summary */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Net worth" value={inr(netWorth)} />
        <Stat label="Cash" value={inr(user.cash)} />
        <Stat label="Holdings" value={inr(holdingsValue)} />
        <Stat
          label="Total return"
          value={`${overallPct >= 0 ? "+" : ""}${overallPct.toFixed(2)}%`}
          tone={overallPct >= 0 ? "up" : "down"}
        />
      </section>

      {/* Holdings */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-foreground">Holdings</h2>
        {priced.length === 0 ? (
          <div className="rounded-2xl border border-surface bg-surface/30 p-8 text-center text-muted">
            No positions yet.{" "}
            <Link href="/" className="text-accent font-medium underline">
              Browse indexes
            </Link>{" "}
            and buy your first basket.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Index</th>
                  <th className="px-4 py-3 font-medium">Weighting</th>
                  <th className="px-4 py-3 text-right font-medium">Units</th>
                  <th className="px-4 py-3 text-right font-medium">Invested</th>
                  <th className="px-4 py-3 text-right font-medium">Value</th>
                  <th className="px-4 py-3 text-right font-medium">P/L</th>
                </tr>
              </thead>
              <tbody>
                {priced.map(({ p, def, value, pl }) => {
                  const plPct = p.cost > 0 ? (pl / p.cost) * 100 : 0;
                  return (
                    <tr
                      key={`${p.slug}-${p.weighting}`}
                      className="border-t border-surface hover:bg-surface/30"
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        <Link
                          href={`/index/${p.slug}`}
                          className="inline-flex items-center gap-1.5 hover:underline"
                        >
                          {def && <IndexIcon slug={def.slug} className="w-5 h-5 text-accent" />}
                          {def?.name ?? p.slug}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {p.weighting === "mcap" ? "Market cap" : "Equal wt"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {p.units.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {inr(p.cost)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {inr(value)}
                      </td>
                      <td
                        className={`px-4 py-3 text-right font-mono font-semibold ${pl >= 0 ? "text-up" : "text-down"}`}
                      >
                        {pl >= 0 ? "+" : ""}
                        {inr(pl)} ({plPct >= 0 ? "+" : ""}
                        {plPct.toFixed(1)}%)
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Trade history */}
      {trades.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">Recent trades</h2>
          <div className="overflow-x-auto rounded-2xl border border-surface">
            <table className="w-full text-sm">
              <thead className="bg-surface/60 text-left text-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Index</th>
                  <th className="px-4 py-3 font-medium">Side</th>
                  <th className="px-4 py-3 text-right font-medium">Units</th>
                  <th className="px-4 py-3 text-right font-medium">Price</th>
                  <th className="px-4 py-3 text-right font-medium">Amount</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((t) => {
                  const def = getIndex(t.slug);
                  return (
                    <tr key={Number(t.id)} className="border-t border-surface">
                      <td className="px-4 py-3 text-muted">
                        {new Date(Number(t.ts)).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 text-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          {def && <IndexIcon slug={def.slug} className="w-5 h-5 text-accent" />}
                          {def?.name ?? t.slug}
                        </span>
                        <span className="ml-1 text-xs text-muted-light">
                          {t.weighting === "mcap" ? "\u00B7 mcap" : "\u00B7 eq"}
                        </span>
                      </td>
                      <td
                        className={`px-4 py-3 font-semibold uppercase ${t.side === "buy" ? "text-up" : "text-down"}`}
                      >
                        {t.side}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {t.units.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {inr(t.price, 2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">
                        {inr(t.amount, 2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <footer className="mt-12 text-center text-xs text-muted-light">
        Paper money only &middot; started with {inr(startWorth)} &middot; not investment advice.
      </footer>
    </main>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="rounded-2xl border border-surface bg-surface/30 p-4">
      <div className="text-xs text-muted">{label}</div>
      <div
        className={`mt-1 font-mono text-xl font-bold ${
          tone === "up"
            ? "text-up"
            : tone === "down"
              ? "text-down"
              : "text-foreground"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
