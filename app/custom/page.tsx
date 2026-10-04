import Link from "next/link";
import { redirect } from "next/navigation";
import { createCustomIndex, deleteCustomIndex, updateCustomIndex } from "@/app/actions";
import CustomIndexForm from "@/components/CustomIndexForm";
import PageHeader from "@/components/ui/PageHeader";
import Panel from "@/components/ui/Panel";
import { getCurrentUser } from "@/lib/auth";
import {
  customId,
  listCollaborators,
  listCustomIndexes,
  type Collaborator,
} from "@/lib/custom-indexes";
import { buildCatalog } from "@/lib/catalog";
import CollaboratorManager from "@/components/CollaboratorManager";
import DeleteCustomIndexButton from "@/components/DeleteCustomIndexButton";
import { ArrowRight } from "@/components/ui/icons";

export const dynamic = "force-dynamic";

export default async function CustomIndexesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const indexes = await listCustomIndexes(user.id);
  const catalog = buildCatalog(indexes);

  const collaboratorsBySlug = new Map<string, Collaborator[]>();
  for (const index of indexes) {
    const id = customId(index.slug);
    if (id != null) collaboratorsBySlug.set(index.slug, await listCollaborators(id));
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <PageHeader
        eyebrow="Your index lab"
        title="Build a custom basket"
        description="Model a portfolio, tune its weights, then pin it beside any Bharat Index in Compare."
        aside={
          <Link
            href="/compare"
            className="inline-flex items-center gap-1.5 rounded-full border border-surface bg-background px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent hover:text-accent"
          >
            Open Compare
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <section className="mb-10">
        <Panel
          label="Create a custom index"
          context={`${indexes.length} saved`}
          bodyClassName="p-0 sm:p-0"
        >
          <div className="p-5 sm:p-6">
            <CustomIndexForm action={createCustomIndex} catalog={catalog} />
          </div>
        </Panel>
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground">
            Saved indexes
            <span className="ml-2 text-sm font-normal text-muted-light">
              {indexes.length}
            </span>
          </h2>
          <span className="hidden font-mono text-[11px] text-muted-light sm:inline">
            editable · compare-ready
          </span>
        </div>

        {indexes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-surface p-10 text-center text-sm text-muted">
            No saved indexes yet. Start with the form above.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {indexes.map((index) => (
              <article
                key={index.slug}
                className="flex flex-col rounded-2xl border border-surface bg-surface/40 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-foreground">
                      {index.name}
                    </h3>
                    <p className="truncate text-sm font-medium text-muted">
                      {index.tagline}
                    </p>
                  </div>
                  <Link
                    href={`/compare?left=${index.slug}`}
                    className="inline-flex shrink-0 items-center gap-1 text-sm font-bold text-accent transition hover:gap-1.5"
                  >
                    Compare
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-foreground/80">
                  {index.blurb}
                </p>

                <p className="mt-3 font-mono text-[11px] text-muted-light">
                  {index.constituents.length} constituents · custom weights
                </p>

                <div className="mt-4 flex flex-1 flex-col justify-end gap-3 border-t border-surface pt-4">
                  <CollaboratorManager
                    slug={index.slug}
                    collaborators={collaboratorsBySlug.get(index.slug) ?? []}
                    isCreator={index.creatorUsername === user.username}
                  />
                  <details className="group">
                    <summary className="cursor-pointer list-none text-sm font-bold text-foreground transition hover:text-accent">
                      Edit basket
                    </summary>
                    <div className="mt-4">
                      <CustomIndexForm
                        action={updateCustomIndex}
                        catalog={catalog}
                        id={index.slug}
                        initial={{
                          name: index.name,
                          tagline: index.tagline,
                          description: index.blurb,
                          sources: index.sources ?? [],
                          constituents: index.constituents.map((c) => ({
                            symbol: c.symbol,
                            name: c.name,
                            weight: c.weight ?? 1,
                          })),
                        }}
                      />
                    </div>
                  </details>
                  <DeleteCustomIndexButton action={deleteCustomIndex} slug={index.slug} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
