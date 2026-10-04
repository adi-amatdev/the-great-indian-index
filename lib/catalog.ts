import { BENCHMARKS } from "./benchmarks";
import { INDICES, type Constituent, type IndexDef } from "./indices";

export type CatalogItem = Constituent & { kind: "stock" | "index"; subtitle?: string };

export function buildCatalog(extra: IndexDef[] = []): CatalogItem[] {
  const items = new Map<string, CatalogItem>();
  for (const index of [...INDICES, ...BENCHMARKS, ...extra]) {
    items.set(index.slug, { symbol: index.slug, name: index.name, kind: "index", subtitle: index.tagline });
    for (const constituent of index.constituents) {
      if (!items.has(constituent.symbol)) items.set(constituent.symbol, { ...constituent, kind: "stock", subtitle: index.name });
    }
  }
  return [...items.values()].sort((a, b) => a.name.localeCompare(b.name));
}
