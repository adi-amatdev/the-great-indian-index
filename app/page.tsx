import Link from "next/link";
import { INDICES } from "@/lib/indices";
import { getIndexData } from "@/lib/yahoo";
import { fmtLevel, fmtPct } from "@/lib/format";
import Sparkline from "@/components/Sparkline";
import IndexIcon from "@/components/IndexIcon";

export const revalidate = 60;

export default async function Home() {
  const data = await Promise.all(
    INDICES.map((def) => getIndexData(def, "1D")),
  );

  const gainers = data.filter((d) => (d.changePct ?? 0) > 0).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-12 sm:py-20">
      <header className="mb-14 text-center">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-surface px-4 py-1.5 text-sm text-muted">
          Live NSE data &middot; rebased to 100
        </div>
        <h1 className="text-5xl font-black tracking-tight text-foreground sm:text-7xl">
          Bharat Indexes
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted">
          Custom index trackers for the themes India does best. Each one clubs a
          group&apos;s stocks into a single S&amp;P-style line so you can watch
          the whole story move together.
        </p>
        <p className="mt-3 text-sm text-muted-light">
          {INDICES.length} indexes &middot; {gainers} up over the last month
        </p>
      </header>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((d, i) => {
          const def = INDICES[i];
          const up = (d.changePct ?? 0) >= 0;
          return (
            <Link
              key={def.slug}
              href={`/index/${def.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-surface bg-surface/50 p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-black/5"
            >
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <IndexIcon slug={def.slug} className="w-8 h-8 text-accent" />
                    <div>
                      <h2 className="text-lg font-bold leading-tight text-foreground">
                        {def.name}
                      </h2>
                      <p className="text-xs text-muted">{def.tagline}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-2xl font-bold text-foreground">
                      {fmtLevel(d.level)}
                    </div>
                    <div className="text-xs text-muted-light">index level</div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      up
                        ? "bg-up-bg text-up"
                        : "bg-down-bg text-down"
                    }`}
                  >
                    {up ? "\u25B2" : "\u25BC"} {fmtPct(d.changePct)}
                  </div>
                </div>

                <div className="mt-3">
                  <Sparkline
                    points={d.points}
                    color={up ? "#588157" : "#a63d40"}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-muted-light">
                  <span>{def.constituents.length} stocks &middot; 1D</span>
                  <span className="font-medium text-muted transition group-hover:text-accent">
                    Open index &rarr;
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="mt-16 text-center text-xs text-muted-light">
        <p>
          Data via Yahoo Finance (NSE, delayed). Indexes are equal-weighted and
          rebased to 100 at the start of each range.
        </p>
        <p className="mt-1">
          For information only, not investment advice.
        </p>
      </footer>
    </main>
  );
}
