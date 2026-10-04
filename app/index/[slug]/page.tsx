import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getIndex, INDICES } from "@/lib/indices";
import { getCustomIndexForUser } from "@/lib/custom-indexes";
import { getCachedIndexData } from "@/lib/index-cache";
import { getCurrentUser } from "@/lib/auth";
import { getPosition } from "@/lib/portfolio";
import IndexDashboard, { Positions } from "@/components/IndexDashboard";
import IndexIcon from "@/components/IndexIcon";
import ConstituentsTable from "@/components/ConstituentsTable";
import Panel from "@/components/ui/Panel";
import PageHeader from "@/components/ui/PageHeader";
import { ArrowLeft, ArrowRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const user = await getCurrentUser();
  const def = getIndex(slug) ?? (user ? await getCustomIndexForUser(user.id, slug) : null);
  if (!def) return { title: "Index not found" };
  return { title: `${def.name} - Bharat Indexes`, description: def.blurb };
}

export default async function IndexPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const def = getIndex(slug) ?? (user ? await getCustomIndexForUser(user.id, slug) : null);
  if (!def) notFound();

  const [[data, data3M]] = await Promise.all([
    Promise.all([
      getCachedIndexData(def, "1D", def.custom ? "custom" : "equal"),
      getCachedIndexData(def, "3M", def.custom ? "custom" : "equal"),
    ]),
  ]);

  let positions: Positions = { equal: null, mcap: null, custom: null };
  if (user) {
    const [eq, mc, custom] = await Promise.all([
      getPosition(user.id, slug, "equal"),
      getPosition(user.id, slug, "mcap"),
      getPosition(user.id, slug, "custom"),
    ]);
    positions = {
      equal: eq ? { units: eq.units, cost: eq.cost } : null,
      mcap: mc ? { units: mc.units, cost: mc.cost } : null,
      custom: custom ? { units: custom.units, cost: custom.cost } : null,
    };
  }

  const others = INDICES.filter((i) => i.slug !== def.slug);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All indexes
      </Link>

      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <IndexIcon slug={def.slug} className="h-4 w-4 text-accent" />
            {def.custom ? "Your custom basket" : "Bharat Index"}
          </span>
        }
        title={def.name}
        description={def.blurb}
        aside={
          def.custom ? (
            <Link
              href="/custom"
              className="rounded-full border border-surface bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
            >
              Edit basket
            </Link>
          ) : undefined
        }
      />

      <IndexDashboard
        slug={def.slug}
        initial={data}
        loggedIn={!!user}
        cash={user ? user.cash : null}
        positions={positions}
      />

      {/* Why this index exists */}
      <section className="mt-10">
        <Panel
          label="The story"
          context={`${def.tagline}`}
          bodyClassName="p-5 sm:p-6"
        >
          <p className="max-w-3xl text-[15px] leading-relaxed text-foreground/80">
            {def.thesis}
          </p>
          {def.sources.length > 0 && (
            <ul className="mt-5 space-y-2">
              {def.sources.map((s) => (
                <li key={s.url} className="text-sm">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex max-w-full flex-wrap items-baseline gap-x-2 rounded-lg px-1 py-0.5 transition hover:bg-surface/60"
                  >
                    <span className="font-semibold text-foreground group-hover:text-accent">
                      {s.title}
                    </span>
                    <span className="text-muted-light">
                      {s.outlet} · {s.date}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-5 border-t border-surface pt-4 text-xs text-muted-light">
            Sources cited for how this theme is moving in the news — an index is
            a lens on a story, not a recommendation.
          </p>
        </Panel>
      </section>

      {/* Constituents */}
      <section className="mt-10">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">
            Constituents
            <span className="ml-2 text-sm font-normal text-muted-light">
              {def.constituents.length} stocks
            </span>
          </h2>
          <span className="hidden font-mono text-[11px] text-muted-light sm:inline">
            selectable performance window
          </span>
        </div>
        <ConstituentsTable slug={def.slug} initial={data3M} />
      </section>

      {/* Other indexes */}
      {others.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-3 text-lg font-bold text-foreground">
            Explore other indexes
          </h2>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {others.map((i) => (
              <Link
                key={i.slug}
                href={`/index/${i.slug}`}
                className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-surface bg-background/60 py-1.5 pl-2.5 pr-3 text-sm text-muted transition hover:border-accent hover:text-foreground"
              >
                <IndexIcon slug={i.slug} className="h-4 w-4 text-accent" />
                {i.name.replace(" Index", "")}
                <ArrowRight className="h-3 w-3 text-muted-light transition group-hover:text-accent" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <footer className="mt-12 text-center text-xs text-muted-light">
        Data via Yahoo Finance (NSE, delayed) · rebased to 100 · paper money
        only · not investment advice.
      </footer>
    </main>
  );
}