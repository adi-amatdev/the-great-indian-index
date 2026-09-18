"use client";

import { useActionState, useState } from "react";
import type { CustomConstituentInput } from "@/lib/custom-indexes";

type ActionState = { error?: string } | undefined;
type Action = (formData: FormData) => Promise<ActionState>;

const emptyRow: CustomConstituentInput = { symbol: "", name: "", weight: 1 };

export default function CustomIndexForm({
  action,
  id,
  initial,
}: {
  action: Action;
  id?: string;
  initial?: { name: string; tagline: string; description: string; constituents: CustomConstituentInput[] };
}) {
  const [state, formAction] = useActionState(async (_previous: ActionState, formData: FormData) => action(formData), undefined);
  const [rows, setRows] = useState<CustomConstituentInput[]>(initial?.constituents ?? [emptyRow, { ...emptyRow }]);

  function updateRow(index: number, key: keyof CustomConstituentInput, value: string) {
    setRows((current) => current.map((row, i) => i === index ? { ...row, [key]: key === "weight" ? Number(value) : value } : row));
  }

  return (
    <form action={formAction} className="space-y-5 rounded-2xl border border-surface bg-surface/40 p-5 sm:p-7">
      {id && <input type="hidden" name="id" value={id} />}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-foreground">Name<input name="name" defaultValue={initial?.name} required maxLength={80} className="mt-1.5 w-full rounded-xl border border-surface bg-background px-3 py-2.5 font-normal outline-none focus:border-accent" placeholder="Intuitifi Model Portfolio" /></label>
        <label className="text-sm font-semibold text-foreground">Tagline<input name="tagline" defaultValue={initial?.tagline} required maxLength={120} className="mt-1.5 w-full rounded-xl border border-surface bg-background px-3 py-2.5 font-normal outline-none focus:border-accent" placeholder="My rules, in one line" /></label>
      </div>
      <label className="block text-sm font-semibold text-foreground">Investment thesis<textarea name="description" defaultValue={initial?.description} required maxLength={500} rows={3} className="mt-1.5 w-full rounded-xl border border-surface bg-background px-3 py-2.5 font-normal outline-none focus:border-accent" placeholder="Why should this basket exist?" /></label>
      <input type="hidden" name="constituents" value={JSON.stringify(rows)} readOnly />
      <div>
        <div className="mb-2 flex items-center justify-between"><div><h3 className="font-bold text-foreground">Constituents and weights</h3><p className="text-xs text-muted">Weights are normalized by the calculator. Yahoo symbols work for NSE, US stocks, commodities, and crypto (for example AAPL, GC=F, BTC-USD).</p></div><button type="button" onClick={() => setRows((current) => [...current, { ...emptyRow }])} className="rounded-full border border-surface px-3 py-1.5 text-sm font-semibold text-muted hover:border-accent hover:text-accent">Add row</button></div>
        <div className="space-y-2">
          {rows.map((row, index) => (
            <div key={index} className="grid grid-cols-[1fr_1.4fr_5rem_2.5rem] gap-2">
              <input aria-label={`Symbol ${index + 1}`} value={row.symbol} onChange={(e) => updateRow(index, "symbol", e.target.value)} className="min-w-0 rounded-lg border border-surface bg-background px-2.5 py-2 text-sm uppercase outline-none focus:border-accent" placeholder="TCS.NS" />
              <input aria-label={`Name ${index + 1}`} value={row.name} onChange={(e) => updateRow(index, "name", e.target.value)} className="min-w-0 rounded-lg border border-surface bg-background px-2.5 py-2 text-sm outline-none focus:border-accent" placeholder="Tata Consultancy Services" />
              <input aria-label={`Weight ${index + 1}`} type="number" min="0.01" step="0.01" value={row.weight} onChange={(e) => updateRow(index, "weight", e.target.value)} className="w-full rounded-lg border border-surface bg-background px-2.5 py-2 text-sm outline-none focus:border-accent" />
              <button type="button" aria-label={`Remove row ${index + 1}`} disabled={rows.length <= 2} onClick={() => setRows((current) => current.filter((_, i) => i !== index))} className="rounded-lg border border-surface text-lg text-muted hover:border-down hover:text-down disabled:opacity-30">×</button>
            </div>
          ))}
        </div>
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-down-bg px-3 py-2 text-sm text-down">{state.error}</p>}
      <button className="rounded-full bg-accent px-5 py-2.5 font-semibold text-white transition hover:bg-accent-hover">{id ? "Save changes" : "Create index"}</button>
    </form>
  );
}
