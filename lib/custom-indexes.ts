import "server-only";

import { prisma } from "./prisma";
import type { IndexDef } from "./indices";

export type CustomConstituentInput = {
  symbol: string;
  name: string;
  weight: number;
};

export function customSlug(id: bigint | number) {
  return `custom-${id.toString()}`;
}

export function customId(slug: string): bigint | null {
  if (!slug.startsWith("custom-")) return null;
  const value = slug.slice("custom-".length);
  return /^\d+$/.test(value) ? BigInt(value) : null;
}

export function toCustomIndex(row: {
  id: bigint;
  name: string;
  tagline: string;
  description: string;
  constituents: CustomConstituentInput[];
}): IndexDef {
  return {
    slug: customSlug(row.id),
    name: row.name,
    tagline: row.tagline,
    blurb: row.description,
    gradient: "from-stone-500 via-zinc-600 to-slate-700",
    accent: "#7d4047",
    thesis: "A user-created basket with explicit constituent weights.",
    sources: [],
    custom: true,
    constituents: row.constituents,
  };
}

export async function listCustomIndexes(userId: bigint) {
  const rows = await prisma.customIndex.findMany({
    where: { userId },
    include: { constituents: { orderBy: { id: "asc" } } },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((row) =>
    toCustomIndex({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      constituents: row.constituents,
    }),
  );
}

export async function getCustomIndexForUser(userId: bigint, slug: string) {
  const id = customId(slug);
  if (id == null) return null;
  const row = await prisma.customIndex.findFirst({
    where: { id, userId },
    include: { constituents: { orderBy: { id: "asc" } } },
  });
  return row
    ? toCustomIndex({
        id: row.id,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        constituents: row.constituents,
      })
    : null;
}
