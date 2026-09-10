import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getIndex, INDICES } from "@/lib/indices";
import { getIndexData } from "@/lib/yahoo";
import { getCurrentUser } from "@/lib/auth";
import { getPosition } from "@/lib/portfolio";
import IndexDashboard, { Positions } from "@/components/IndexDashboard";
import IndexIcon from "@/components/IndexIcon";
import ConstituentsTable from "@/components/ConstituentsTable";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const def = getIndex(slug);
  if (!def) return { title: "Index not found" };
  return { title: `${def.name} - Bharat Indexes`, description: def.blurb };
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const def = getIndex(slug);
  if (!def) notFound();

  const [[data, data3M], user] = await Promise.all([
    Promise.all([
      getIndexData(def, "1D", "equal"),
      getIndexData(def, "3M", "equal"),
    ]),
    getCurrentUser(),
  ]);

  let positions: Positions = { equal: null, mcap: null };
  if (user) {
    const [eq, mc] = await Promise.all([
      getPosition(user.id, slug, "equal"),
      getPosition(user.id, slug, "mcap"),
    ]);
    positions = {
      equal: eq ? { units: eq.units, cost: eq.cost } : null,
      mcap: mc ? { units: mc.units, cost: mc.cost } : null,
    };
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted transition hover:text-foreground"
      >
        &larr; All indexes
      </Link>

      {/* Hero */}
      <section className="relative mt-4 overflow-hidden rounded-2xl border border-surface bg-surface/50 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <IndexIcon
            slug={def.slug}
            className="w-12 h-12 text-accent"
          />
          <div>
            <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
              {def.name}
            </h1>
            <p className="text-muted">{def.tagline}</p>
          </div>
        </div>

        <p className="mt-5 max-w-3xl text-sm leading-relaxed text-muted">
          {def.blurb}
        </p>

        <div className="mt-6">
          <IndexDashboard
            slug={def.slug}
            initial={data}
            loggedIn={!!user}
            cash={user ? user.cash : null}
            positions={positions}
          />
        </div>
      </section>

      {/* Constituents */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-foreground">
          Constituents{" "}
          <span className="text-sm font-normal text-muted-light">
            ({def.constituents.length} stocks &middot; selectable performance window)
          </span>
        </h2>
        <ConstituentsTable slug={def.slug} initial={data3M} />
      </section>

      {/* Other indexes */}
      <section className="mt-10">
        <h2 className="mb-3 text-lg font-bold text-foreground">Explore other indexes</h2>
        <div className="flex flex-wrap gap-2">
          {INDICES.filter((i) => i.slug !== def.slug).map((i) => (
            <Link
              key={i.slug}
              href={`/index/${i.slug}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-surface bg-surface/40 px-3 py-1.5 text-sm text-muted transition hover:border-accent hover:text-accent"
            >
              <IndexIcon slug={i.slug} className="w-4 h-4 text-accent" />
              {i.name.replace(" Index", "")}
            </Link>
          ))}
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-muted-light">
        Data via Yahoo Finance (NSE, delayed) &middot; rebased to 100 &middot; paper money only
        &middot; not investment advice.
      </footer>
    </main>
  );
}
