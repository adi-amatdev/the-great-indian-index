import "server-only";

import { after } from "next/server";
import { prisma } from "./prisma";
import type { IndexDef } from "./indices";
import { getIndexData, type IndexData, type RangeKey, type Weighting } from "./yahoo";

// TTL tiers (ms) for a cached series, driven by how often users actually ask
// for it. Cold combos stay fresh enough to feel live; hot combos are kept for
// longer and pre-warmed before they expire so popular pages never wait on Yahoo.
const COLD_TTL = 90_000; // < 10 hits
const WARM_TTL = 5 * 60_000; // 10-49 hits
const HOT_TTL = 15 * 60_000; // >= 50 hits
const HOT_HITS = 25; // combos at/above this are pre-warmed in the background
const PREWARM_AT = 0.6; // refresh hot rows once past 60% of their TTL
const PRUNE_KEEP_HITS = 10; // rows with fewer hits than this are evicted...
const PRUNE_AGE = 7 * 24 * 60 * 60_000; // ...if untouched for a week

function ttlFor(hitCount: number): number {
  if (hitCount >= 50) return HOT_TTL;
  if (hitCount >= 10) return WARM_TTL;
  return COLD_TTL;
}

function hash(input: string): string {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

export function indexCacheKey(
  def: IndexDef,
  rangeKey: RangeKey,
  weighting: Weighting,
): string {
  // Custom indexes are mutable, so sign their constituents+weights: an edit
  // produces a fresh key instead of serving a stale series.
  if (def.custom) {
    const sig = hash(
      def.constituents.map((c) => `${c.symbol}:${c.weight ?? 1}`).join("|"),
    );
    return `custom:${sig}:${rangeKey}:${weighting}`;
  }
  return `${def.slug}:${rangeKey}:${weighting}`;
}

// Schedule work after the response is flushed. `after` needs a request context;
// fall back to running inline so the cache still works outside of one.
function schedule(callback: () => Promise<unknown>) {
  try {
    after(() => {
      void callback();
    });
  } catch {
    void callback();
  }
}

// One in-flight compute per key per process, so a cold-cache burst doesn't
// hammer Yahoo with a thundering herd of identical fetches.
const inFlight = new Map<string, Promise<IndexData>>();

/**
 * Frequency-aware cached index series. Frequently-requested (slug, range,
 * weighting) combos are served from Postgres with long TTLs and refreshed in
 * the background before they expire; rarely-requested combos get a short TTL.
 */
export async function getCachedIndexData(
  def: IndexDef,
  rangeKey: RangeKey,
  weighting: Weighting,
): Promise<IndexData> {
  const key = indexCacheKey(def, rangeKey, weighting);
  const now = Date.now();
  const row = await prisma.indexCache.findUnique({ where: { key } });

  if (row) {
    const hitCount = row.hitCount;
    const age = now - Number(row.updatedAt);
    const ttl = ttlFor(hitCount);

    // Hot rows past 60% of their TTL get refreshed in the background so the
    // next user hits warm data (stale-while-revalidate / "keep ready").
    if (hitCount >= HOT_HITS && age > ttl * PREWARM_AT) {
      schedule(() => refresh(def, rangeKey, weighting));
    }

    if (age <= ttl) {
      schedule(() => bump(key, now));
      return row.data as IndexData;
    }
  }

  const pending = inFlight.get(key);
  if (pending) return pending;

  const compute = (async () => {
    const data = await getIndexData(def, rangeKey, weighting);
    try {
      await prisma.indexCache.upsert({
        where: { key },
        create: {
          key,
          slug: def.slug,
          range: rangeKey,
          weighting,
          data,
          hitCount: 1,
          requestedAt: now,
          updatedAt: now,
          createdAt: now,
        },
        update: {
          data,
          hitCount: { increment: 1 },
          requestedAt: now,
          updatedAt: now,
        },
      });
      schedule(() => prune());
    } catch {
      // Cache writes are best-effort; serve the fresh data regardless.
    }
    return data;
  })();

  inFlight.set(key, compute);
  compute
    .finally(() => {
      if (inFlight.get(key) === compute) inFlight.delete(key);
    })
    .catch(() => {});
  return compute;
}

async function refresh(
  def: IndexDef,
  rangeKey: RangeKey,
  weighting: Weighting,
): Promise<void> {
  const key = indexCacheKey(def, rangeKey, weighting);
  try {
    const data = await getIndexData(def, rangeKey, weighting);
    await prisma.indexCache.update({
      where: { key },
      data: { data, updatedAt: Date.now() },
    });
  } catch {
    // Keep serving the existing entry.
  }
}

async function bump(key: string, at: number): Promise<void> {
  try {
    await prisma.indexCache.update({
      where: { key },
      data: { hitCount: { increment: 1 }, requestedAt: at },
    });
  } catch {
    // Best-effort.
  }
}

// Probabilistic housekeeping: evict rarely-requested rows that haven't been
// touched in a week so the table stays bounded to what users actually want.
async function prune(): Promise<void> {
  if (Math.random() > 0.01) return;
  try {
    await prisma.indexCache.deleteMany({
      where: {
        hitCount: { lt: PRUNE_KEEP_HITS },
        updatedAt: { lt: Date.now() - PRUNE_AGE },
      },
    });
  } catch {
    // Best-effort.
  }
}