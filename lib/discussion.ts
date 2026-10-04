import "server-only";

import { prisma } from "./prisma";

export async function listDiscussionPosts(slug: string) {
  const rows = await prisma.indexDiscussionPost.findMany({
    where: { slug },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map((row) => ({
    id: row.id.toString(),
    body: row.body,
    username: row.user.username,
    userId: row.userId.toString(),
    createdAt: Number(row.createdAt),
  }));
}

export async function createDiscussionPost(userId: bigint, slug: string, body: string) {
  const clean = body.trim();
  if (clean.length < 2) return { ok: false, error: "Write at least 2 characters." } as const;
  if (clean.length > 1000) return { ok: false, error: "Keep posts under 1,000 characters." } as const;
  await prisma.indexDiscussionPost.create({ data: { slug, userId, body: clean, createdAt: BigInt(Date.now()) } });
  return { ok: true } as const;
}

export async function deleteDiscussionPost(userId: bigint, postId: bigint) {
  const result = await prisma.indexDiscussionPost.deleteMany({ where: { id: postId, userId } });
  return result.count ? ({ ok: true } as const) : ({ ok: false, error: "Post not found." } as const);
}
