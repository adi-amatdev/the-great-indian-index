import "server-only";

import { prisma } from "./prisma";
import type { IndexDef, IndexSource } from "./indices";

export type CustomConstituentInput = {
  symbol: string;
  name: string;
  weight: number;
};

export type Collaborator = {
  userId: bigint;
  username: string;
  role: string;
  addedBy: bigint;
  createdAt: bigint;
};

export function customSlug(id: bigint | number) {
  return `custom-${id.toString()}`;
}

export function customId(slug: string): bigint | null {
  if (!slug.startsWith("custom-")) return null;
  const value = slug.slice("custom-".length);
  return /^\d+$/.test(value) ? BigInt(value) : null;
}

function parseSources(raw: unknown): IndexSource[] {
  if (!Array.isArray(raw)) return [];
  const out: IndexSource[] = [];
  for (const item of raw) {
    const row = item as Record<string, unknown>;
    const title = String(row.title ?? "").trim();
    const url = String(row.url ?? "").trim();
    if (!title || !url) continue;
    out.push({
      title,
      url,
      outlet: String(row.outlet ?? "").trim(),
      date: String(row.date ?? "").trim(),
    });
  }
  return out.slice(0, 6);
}

export function toCustomIndex(row: {
  id: bigint;
  name: string;
  tagline: string;
  description: string;
  sources?: unknown;
  creatorUsername?: string;
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
    sources: parseSources(row.sources),
    custom: true,
    creatorUsername: row.creatorUsername,
    constituents: row.constituents,
  };
}

// ---- Access / membership ----------------------------------------------------

function accessibleWhere(userId: bigint) {
  return {
    OR: [{ userId }, { collaborators: { some: { userId } } }],
  };
}

/** True if the user created the index or was invited as a co-owner. */
export async function canEditCustomIndex(
  userId: bigint,
  customIndexId: bigint,
): Promise<boolean> {
  const row = await prisma.customIndex.findFirst({
    where: {
      id: customIndexId,
      OR: [{ userId }, { collaborators: { some: { userId } } }],
    },
    select: { id: true },
  });
  return row != null;
}

/** Fetch a custom index the user can see (creator or co-owner). */
export async function getCustomIndexForUser(
  userId: bigint,
  slug: string,
): Promise<IndexDef | null> {
  const row = await prisma.customIndex.findFirst({
    where: { slug, ...accessibleWhere(userId) },
    include: {
      constituents: { orderBy: { id: "asc" } },
      user: { select: { username: true } },
    },
  });
  return row
    ? toCustomIndex({
        id: row.id,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        sources: row.sources,
        creatorUsername: row.user.username,
        constituents: row.constituents,
      })
    : null;
}

/** All custom indexes the user can see, newest first. */
export async function listCustomIndexes(userId: bigint) {
  const rows = await prisma.customIndex.findMany({
    where: accessibleWhere(userId),
    include: {
      constituents: { orderBy: { id: "asc" } },
      user: { select: { username: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map((row) =>
    toCustomIndex({
      id: row.id,
      name: row.name,
      tagline: row.tagline,
      description: row.description,
      sources: row.sources,
      creatorUsername: row.user.username,
      constituents: row.constituents,
    }),
  );
}

// ---- Collaborators ----------------------------------------------------------

export async function listCollaborators(customIndexId: bigint): Promise<Collaborator[]> {
  const rows = await prisma.customIndexCollaborator.findMany({
    where: { customIndexId },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((row) => ({
    userId: row.userId,
    username: row.user.username,
    role: row.role,
    addedBy: row.addedBy,
    createdAt: row.createdAt,
  }));
}

export async function addCollaborator(
  customIndexId: bigint,
  username: string,
  addedBy: bigint,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const target = await prisma.user.findUnique({
    where: { username: username.trim().toLowerCase() },
    select: { id: true, username: true },
  });
  if (!target) return { ok: false, error: "No account with that username." };
  if (target.id === addedBy)
    return { ok: false, error: "You already own this index." };

  const already = await prisma.customIndexCollaborator.findUnique({
    where: { customIndexId_userId: { customIndexId, userId: target.id } },
  });
  if (already)
    return { ok: false, error: `@${target.username} is already a co-owner.` };

  await prisma.customIndexCollaborator.create({
    data: {
      customIndexId,
      userId: target.id,
      role: "editor",
      addedBy,
      createdAt: BigInt(Date.now()),
    },
  });
  return { ok: true };
}

export async function removeCollaborator(
  customIndexId: bigint,
  username: string,
  actorId: bigint,
  actorIsCreator: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const target = await prisma.user.findUnique({
    where: { username: username.trim().toLowerCase() },
    select: { id: true, username: true },
  });
  if (!target) return { ok: false, error: "No account with that username." };
  if (target.id === actorId) return { ok: false, error: "The creator owns the index." };

  const row = await prisma.customIndexCollaborator.findUnique({
    where: { customIndexId_userId: { customIndexId, userId: target.id } },
  });
  if (!row) return { ok: false, error: "@username is not a co-owner." };
  if (!actorIsCreator && actorId !== target.id)
    return { ok: false, error: "Only the creator can remove co-owners." };

  await prisma.customIndexCollaborator.delete({
    where: { customIndexId_userId: { customIndexId, userId: target.id } },
  });
  return { ok: true };
}