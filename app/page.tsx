import Link from "next/link";
import { INDICES } from "@/lib/indices";
import { getIndexData } from "@/lib/yahoo";
import { fmtLevel, fmtPct } from "@/lib/format";
import Sparkline from "@/components/Sparkline";

export const revalidate = 60;

export default async function Home() {
  // Fetch every index's 1M snapshot in parallel for the landing grid.
  const data = await Promise.all(
    INDICES.map((def) => getIndexData(def, "1M")),
  );

  const gainers = data.filter((d) => (d.changePct ?? 0) > 0).length;

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-16">
      <header className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70">
          <span className="text-base">🇮🇳</span> Live NSE data · rebased to 100
        </div>
        <h1 className="bg-gradient-to-r from-orange-300 via-white to-green-300 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-6xl">
          Bharat Indexes
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/60 sm:text-lg">
          Custom index trackers for the themes India does best. Each one clubs a
          group&apos;s stocks into a single S&amp;P-style line so you can watch
          the whole story move together.
        </p>
        <p className="mt-3 text-sm text-white/40">
          {INDICES.length} indexes · {gainers} up over the last month
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
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.06]"
            >
              <div
                className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${def.gradient} opacity-20 blur-2xl transition group-hover:opacity-40`}
              />
              <div className="relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{def.emoji}</span>
                    <div>
                      <h2 className="text-lg font-bold leading-tight">
                        {def.name}
                      </h2>
                      <p className="text-xs text-white/50">{def.tagline}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="font-mono text-2xl font-bold">
                      {fmtLevel(d.level)}
                    </div>
                    <div className="text-xs text-white/40">index level</div>
                  </div>
                  <div
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      up
                        ? "bg-green-500/15 text-green-300"
                        : "bg-red-500/15 text-red-300"
                    }`}
                  >
                    {up ? "▲" : "▼"} {fmtPct(d.changePct)}
                  </div>
                </div>

                <div className="mt-3">
                  <Sparkline
                    points={d.points}
                    color={up ? "#22c55e" : "#ef4444"}
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-white/40">
                  <span>{def.constituents.length} stocks · 1M</span>
                  <span className="font-medium text-white/60 transition group-hover:text-white">
                    Open index →
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <footer className="mt-14 text-center text-xs text-white/35">
        <p>
          Data via Yahoo Finance (NSE, delayed). Indexes are equal-weighted and
          rebased to 100 at the start of each range.
        </p>
        <p className="mt-1">
          For information only — not investment advice.
        </p>
      </footer>
    </main>
  );
}
