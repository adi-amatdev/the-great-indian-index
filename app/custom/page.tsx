import Link from "next/link";
import { redirect } from "next/navigation";
import { createCustomIndex, deleteCustomIndex, updateCustomIndex } from "@/app/actions";
import CustomIndexForm from "@/components/CustomIndexForm";
import { getCurrentUser } from "@/lib/auth";
import { listCustomIndexes } from "@/lib/custom-indexes";

export const dynamic = "force-dynamic";

export default async function CustomIndexesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const indexes = await listCustomIndexes(user.id);
  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:py-14">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4"><div><Link href="/" className="text-sm text-muted hover:text-foreground">&larr; Home</Link><h1 className="mt-3 text-4xl font-black tracking-tight text-foreground">Your index lab</h1><p className="mt-2 max-w-2xl text-muted">Build a model portfolio, tune its weights, then pin it beside any Bharat Index in Compare.</p></div><Link href="/compare" className="rounded-full border border-surface px-4 py-2 text-sm font-semibold text-muted hover:border-accent hover:text-accent">Open Compare</Link></div>
      <section className="mb-12"><h2 className="mb-3 text-lg font-bold text-foreground">Create a custom index</h2><CustomIndexForm action={createCustomIndex} /></section>
      <section><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold text-foreground">Saved indexes <span className="font-normal text-muted-light">({indexes.length})</span></h2></div>{indexes.length === 0 ? <div className="rounded-2xl border border-dashed border-surface p-8 text-center text-sm text-muted">No saved indexes yet. Start with the form above.</div> : <div className="grid gap-4 md:grid-cols-2">{indexes.map((index) => <article key={index.slug} className="rounded-2xl border border-surface bg-surface/40 p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-foreground">{index.name}</h3><p className="text-sm text-muted">{index.tagline}</p></div><Link href={`/compare?left=${index.slug}`} className="text-sm font-semibold text-accent hover:underline">Compare &rarr;</Link></div><p className="mt-3 text-sm leading-relaxed text-muted">{index.blurb}</p><p className="mt-3 text-xs text-muted-light">{index.constituents.length} constituents &middot; custom weights</p><details className="mt-4"><summary className="cursor-pointer text-sm font-semibold text-muted">Edit basket</summary><div className="mt-4"><CustomIndexForm action={updateCustomIndex} id={index.slug} initial={{ name: index.name, tagline: index.tagline, description: index.blurb, constituents: index.constituents.map((c) => ({ symbol: c.symbol, name: c.name, weight: c.weight ?? 1 })) }} /></div></details><form action={deleteCustomIndex} className="mt-4"><input type="hidden" name="id" value={index.slug} /><button className="text-xs font-semibold text-down hover:underline">Delete index</button></form></article>)}</div>}</section>
    </main>
  );
}
