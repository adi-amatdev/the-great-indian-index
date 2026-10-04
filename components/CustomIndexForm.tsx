"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import type { CatalogItem } from "@/lib/catalog";
import type { CustomConstituentInput } from "@/lib/custom-indexes";
import type { IndexSource } from "@/lib/indices";

type ActionState = { error?: string } | undefined;
type Action = (formData: FormData) => Promise<ActionState>;
const emptyRow: CustomConstituentInput = { symbol: "", name: "", weight: 1 };
const emptySource: IndexSource = { title: "", outlet: "", date: "", url: "" };

function useDebouncedQueries(value: string[], delay = 250) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default function CustomIndexForm({
  action,
  id,
  initial,
  catalog,
}: {
  action: Action;
  id?: string;
  initial?: {
    name: string;
    tagline: string;
    description: string;
    sources?: IndexSource[];
    constituents: CustomConstituentInput[];
  };
  catalog: CatalogItem[];
}) {
  const [state, formAction] = useActionState(
    async (_previous: ActionState, formData: FormData) => action(formData),
    undefined,
  );
  const [rows, setRows] = useState<CustomConstituentInput[]>(
    initial?.constituents ?? [emptyRow, { ...emptyRow }],
  );
  const [queries, setQueries] = useState<string[]>(
    initial?.constituents.map((row) =>
      row.symbol ? `${row.name} (${row.symbol})` : "",
    ) ?? ["", ""],
  );
  const [focusedRow, setFocusedRow] = useState<number | null>(null);
  const [sources, setSources] = useState<IndexSource[]>(initial?.sources ?? []);
  const debouncedQueries = useDebouncedQueries(queries);

  const weightSum = useMemo(
    () => rows.reduce((sum, row) => sum + (Number(row.weight) || 0), 0),
    [rows],
  );
  const filled = rows.filter((row) => row.symbol).length;

  function updateRow(index: number, key: keyof CustomConstituentInput, value: string) {
    setRows((current) =>
      current.map((row, i) =>
        i === index ? { ...row, [key]: key === "weight" ? Number(value) : value } : row,
      ),
    );
  }
  function selectConstituent(index: number, item: CatalogItem) {
    if (item.kind !== "stock") return;
    setRows((current) =>
      current.map((row, i) =>
        i === index ? { symbol: item.symbol, name: item.name, weight: row.weight || 1 } : row,
      ),
    );
    setQueries((current) =>
      current.map((query, i) => (i === index ? `${item.name} (${item.symbol})` : query)),
    );
    setFocusedRow(null);
  }
  function addRow() {
    setRows((current) => [...current, { ...emptyRow }]);
    setQueries((current) => [...current, ""]);
  }
  function removeRow(index: number) {
    setRows((current) => current.filter((_, i) => i !== index));
    setQueries((current) => current.filter((_, i) => i !== index));
  }
  function updateSource(index: number, key: keyof IndexSource, value: string) {
    setSources((current) =>
      current.map((source, i) => (i === index ? { ...source, [key]: value } : source)),
    );
  }
  function addSource() {
    setSources((current) => [...current, { ...emptySource }]);
  }
  function removeSource(index: number) {
    setSources((current) => current.filter((_, i) => i !== index));
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-2xl border border-surface bg-surface/40 p-5 text-foreground shadow-sm sm:p-6"
    >
      {id && <input type="hidden" name="id" value={id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
            Name
          </span>
          <input
            name="name"
            defaultValue={initial?.name}
            required
            maxLength={80}
            placeholder="Intuitifi Model Portfolio"
            className="w-full rounded-xl border border-surface bg-background px-3 py-2.5 text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
            Tagline
          </span>
          <input
            name="tagline"
            defaultValue={initial?.tagline}
            required
            maxLength={120}
            placeholder="My rules, in one line"
            className="w-full rounded-xl border border-surface bg-background px-3 py-2.5 text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1.5 block font-mono text-[11px] font-bold uppercase tracking-wider text-muted">
          Investment thesis
        </span>
        <textarea
          name="description"
          defaultValue={initial?.description}
          required
          maxLength={500}
          rows={3}
          placeholder="Why should this basket exist?"
          className="w-full rounded-xl border border-surface bg-background px-3 py-2.5 leading-relaxed text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
        />
      </label>

      {/* Sources */}
      <div>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-foreground">Sources</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Optional links backing your thesis — like the pharma index&apos;s
              news citations. Title and URL are required per row.
            </p>
          </div>
          <button
            type="button"
            onClick={addSource}
            className="shrink-0 rounded-full border border-surface bg-background px-3.5 py-1.5 text-sm font-bold text-foreground transition hover:border-accent hover:text-accent"
          >
            + Add source
          </button>
        </div>

        <input type="hidden" name="sources" value={JSON.stringify(sources)} readOnly />

        {sources.length > 0 ? (
          <div className="space-y-2.5">
            {sources.map((source, index) => (
              <div
                key={index}
                className="grid gap-2 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.6fr)_2.5rem] sm:items-center"
              >
                <input
                  aria-label={`Source ${index + 1} title`}
                  value={source.title}
                  onChange={(e) => updateSource(index, "title", e.target.value)}
                  placeholder="Article title"
                  className="rounded-xl border border-surface bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
                />
                <input
                  aria-label={`Source ${index + 1} outlet`}
                  value={source.outlet}
                  onChange={(e) => updateSource(index, "outlet", e.target.value)}
                  placeholder="Outlet"
                  className="rounded-xl border border-surface bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
                />
                <input
                  aria-label={`Source ${index + 1} date`}
                  value={source.date}
                  onChange={(e) => updateSource(index, "date", e.target.value)}
                  placeholder="Date · Aug 12, 2026"
                  className="rounded-xl border border-surface bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
                />
                <input
                  aria-label={`Source ${index + 1} URL`}
                  value={source.url}
                  onChange={(e) => updateSource(index, "url", e.target.value)}
                  placeholder="https://…"
                  inputMode="url"
                  className="rounded-xl border border-surface bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
                />
                <button
                  type="button"
                  aria-label={`Remove source ${index + 1}`}
                  onClick={() => removeSource(index)}
                  className="rounded-xl border border-surface bg-background text-lg leading-none text-muted transition hover:border-down hover:text-down"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-surface px-3 py-3 text-center text-xs text-muted">
            No sources yet — add links to the news behind your thesis.
          </div>
        )}
      </div>

      <input type="hidden" name="constituents" value={JSON.stringify(rows)} readOnly />

      <div>
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-foreground">Choose constituents</h3>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Search by company name or ticker, then pick a result. Weights are
              normalized by the calculator.
            </p>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="shrink-0 rounded-full border border-surface bg-background px-3.5 py-1.5 text-sm font-bold text-foreground transition hover:border-accent hover:text-accent"
          >
            + Add row
          </button>
        </div>

        <div className="space-y-2.5">
          {rows.map((row, index) => {
            const query = debouncedQueries[index] ?? "";
            const matches = catalog
              .filter(
                (item) =>
                  item.kind === "stock" &&
                  `${item.name} ${item.symbol}`
                    .toLowerCase()
                    .includes(query.toLowerCase()),
              )
              .slice(0, 6);
            return (
              <div
                key={index}
                className="grid grid-cols-[minmax(0,1fr)_6.5rem_2.5rem] items-center gap-2"
              >
                <div className="relative">
                  <input
                    aria-label={`Search constituent ${index + 1}`}
                    value={queries[index] ?? ""}
                    onChange={(event) => {
                      setQueries((current) =>
                        current.map((value, i) => (i === index ? event.target.value : value)),
                      );
                      setFocusedRow(index);
                    }}
                    onFocus={() => setFocusedRow(index)}
                    placeholder="Search ticker or company name"
                    className="w-full rounded-xl border border-surface bg-background px-3 py-2.5 text-foreground outline-none transition placeholder:text-muted-light focus:border-accent"
                  />
                  {focusedRow === index && query && (
                    <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-xl border border-surface bg-background shadow-xl shadow-black/10">
                      {matches.length ? (
                        matches.map((item) => (
                          <button
                            type="button"
                            key={item.symbol}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => selectConstituent(index, item)}
                            className="block w-full border-b border-surface/70 px-3 py-2.5 text-left last:border-0 hover:bg-surface"
                          >
                            <strong className="block text-sm text-foreground">
                              {item.name}
                            </strong>
                            <span className="text-xs text-muted">
                              {item.symbol} · {item.subtitle}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="px-3 py-3 text-sm text-muted">
                          No matching constituent.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="relative">
                  <input
                    aria-label={`Weight ${index + 1}`}
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={row.weight}
                    onChange={(event) => updateRow(index, "weight", event.target.value)}
                    className="w-full rounded-xl border border-surface bg-background px-3 py-2.5 pr-6 text-foreground outline-none transition focus:border-accent"
                  />
                  <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-light">
                    ×
                  </span>
                </div>

                <button
                  type="button"
                  aria-label={`Remove row ${index + 1}`}
                  disabled={rows.length <= 2}
                  onClick={() => removeRow(index)}
                  className="rounded-xl border border-surface bg-background text-lg leading-none text-muted transition hover:border-down hover:text-down disabled:opacity-30"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-muted">
            {filled} of {rows.length} constituents chosen
          </span>
          <span
            className={`rounded-full px-2.5 py-1 font-mono font-semibold tabular-nums ${
              Math.abs(weightSum - 100) < 0.01
                ? "bg-up-bg text-up"
                : "bg-surface text-muted"
            }`}
          >
            total weight: {weightSum.toFixed(2)}%
          </span>
        </div>
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl bg-down-bg px-3.5 py-2.5 text-sm font-semibold text-down"
        >
          {state.error}
        </p>
      )}

      <div className="flex items-center justify-end gap-3">
        <span className="text-xs text-muted-light">
          Saved baskets appear in Compare.
        </span>
        <button className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-hover">
          {id ? "Save changes" : "Create index"}
        </button>
      </div>
    </form>
  );
}