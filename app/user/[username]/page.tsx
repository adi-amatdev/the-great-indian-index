import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { prisma } from "@/lib/prisma";
import { toCustomIndex } from "@/lib/custom-indexes";
import { isAdmin } from "@/lib/admin";
import PageHeader from "@/components/ui/PageHeader";
import Panel from "@/components/ui/Panel";
import StatCard from "@/components/ui/StatCard";
import ProfileEditForm from "@/components/ProfileEditForm";
import IndexIcon from "@/components/IndexIcon";
import { ArrowRight, LogOut } from "@/components/ui/icons";
import AccountDangerZone from "@/components/AccountDangerZone";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} - Bharat Indexes`,
    description: `Paper-trading profile for @${username}.`,
  };
}

type LinkRow = { label: string; url: string };

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const currentUser = await getCurrentUser();

  const profile = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true, email: true, bio: true, about: true, links: true, createdAt: true },
  });
  if (!profile) notFound();

  const indexes = await prisma.customIndex.findMany({
    where: {
      OR: [
        { userId: profile.id },
        { collaborators: { some: { userId: profile.id } } },
      ],
    },
    include: {
      constituents: { orderBy: { id: "asc" } },
      user: { select: { username: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const owned = indexes.filter((i) => i.userId === profile.id).length;
  const coOwned = indexes.length - owned;
  const isSelf = currentUser?.id === profile.id;
  const admin = isSelf && isAdmin(currentUser);
  const links = (Array.isArray(profile.links) ? profile.links : []) as LinkRow[];
  const memberSince = new Date(Number(profile.createdAt)).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-5 sm:py-12">
      <PageHeader
        eyebrow="Paper-trader profile"
        title={`@${profile.username}`}
        description={profile.bio ?? "No bio yet."}
        aside={
          isSelf ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              {admin && (
                <Link href="/admin" className="rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-white transition hover:bg-accent-hover">
                  Admin dashboard
                </Link>
              )}
              <form action={logoutAction}>
                <button className="inline-flex items-center gap-1.5 rounded-full border border-surface bg-background px-3 py-1.5 text-xs font-bold text-muted transition hover:border-accent hover:text-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                  Log out
                </button>
              </form>
            </div>
          ) : undefined
        }
      />

      {/* Stats */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Member since" value={memberSince} />
        <StatCard label="Indexes created" value={owned} />
        <StatCard label="Co-owner of" value={coOwned} />
        <StatCard label="Links" value={links.length} hint="in their profile" />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* About + links */}
        <div className="space-y-6 lg:col-span-1">
          <Panel label="About" bodyClassName="p-5">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
              {profile.about || "Nothing written here yet."}
            </p>
            {links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-surface pt-4">
                {links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-surface bg-background px-3 py-1 text-xs font-semibold text-muted transition hover:border-accent hover:text-accent"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </Panel>

          {isSelf && (
            <ProfileEditForm
              bio={profile.bio ?? ""}
              email={profile.email ?? ""}
              about={profile.about ?? ""}
              links={links}
            />
          )}
          {isSelf && <AccountDangerZone />}
        </div>

        {/* Their indexes */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-lg font-bold text-foreground">
              Custom indexes
              <span className="ml-2 text-sm font-normal text-muted-light">
                {indexes.length}
              </span>
            </h2>
            <span className="hidden font-mono text-[11px] text-muted-light sm:inline">
              creator + co-owner
            </span>
          </div>

          {indexes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-surface p-10 text-center text-sm text-muted">
              No custom indexes yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {indexes.map((row) => {
                const def = toCustomIndex({
                  id: row.id,
                  name: row.name,
                  tagline: row.tagline,
                  description: row.description,
                  sources: row.sources,
                  creatorUsername: row.user.username,
                  constituents: row.constituents,
                });
                const created = row.userId === profile.id;
                return (
                  <article
                    key={row.slug}
                    className="flex flex-col rounded-2xl border border-surface bg-surface/40 p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <IndexIcon slug={def.slug} className="h-6 w-6 text-accent" />
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-bold text-foreground">
                            {row.name}
                          </h3>
                          <p className="truncate text-xs text-muted">
                            {created ? "created" : "co-owned"} by @{row.user.username}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-foreground/80">
                      {row.description}
                    </p>
                    <div className="mt-4 flex flex-1 items-end justify-between gap-3 border-t border-surface pt-3">
                      <span className="font-mono text-[11px] text-muted-light">
                        {row.constituents.length} constituents · custom weights
                      </span>
                      <Link
                        href={`/compare?left=${def.slug}`}
                        className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-accent transition hover:gap-1.5"
                      >
                        Analyze
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
