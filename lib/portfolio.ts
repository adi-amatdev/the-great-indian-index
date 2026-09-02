import "server-only";
import { prisma } from "./prisma";

export type TradeResult = { ok: true } | { ok: false; error: string };

export async function getPosition(userId: bigint, slug: string, weighting: string) {
  return prisma.position.findUnique({
    where: { userId_slug_weighting: { userId, slug, weighting } },
  });
}

export async function getAllPositions(userId: bigint) {
  return prisma.position.findMany({
    where: { userId, units: { gt: 0.0000001 } },
    orderBy: { slug: "asc" },
  });
}

export async function getTrades(userId: bigint, limit = 50) {
  return prisma.trade.findMany({
    where: { userId },
    orderBy: { ts: "desc" },
    take: limit,
  });
}

export async function buy(
  userId: bigint,
  slug: string,
  weighting: string,
  amount: number,
  spot: number,
): Promise<TradeResult> {
  if (!(amount > 0)) return { ok: false, error: "Enter a positive amount." };
  if (!(spot > 0)) return { ok: false, error: "Price unavailable right now." };

  const ran = await prisma.$transaction(async (tx) => {
    // Atomic, race-safe cash deduction.
    const user = await tx.user.findFirstOrThrow({ where: { id: userId } });
    if (user.cash < amount) return false;
    await tx.user.update({
      where: { id: userId },
      data: { cash: user.cash - amount },
    });

    const units = amount / spot;
    await tx.position.upsert({
      where: { userId_slug_weighting: { userId, slug, weighting } },
      create: { userId, slug, weighting, units, cost: amount },
      update: {
        units: { increment: units },
        cost: { increment: amount },
      },
    });
    await tx.trade.create({
      data: {
        userId,
        slug,
        weighting,
        side: "buy",
        units,
        price: spot,
        amount,
        ts: BigInt(Date.now()),
      },
    });
    return true;
  });

  return ran ? { ok: true } : { ok: false, error: "Not enough cash for that amount." };
}

export async function sell(
  userId: bigint,
  slug: string,
  weighting: string,
  units: number,
  spot: number,
): Promise<TradeResult> {
  if (!(units > 0))
    return { ok: false, error: "Enter a positive number of units." };
  if (!(spot > 0)) return { ok: false, error: "Price unavailable right now." };

  const ran = await prisma.$transaction(async (tx) => {
    const pos = await tx.position.findUnique({
      where: { userId_slug_weighting: { userId, slug, weighting } },
    });
    if (!pos || pos.units < units) return false;

    // Reduce cost basis proportionally to units sold.
    const costReduction = (units / pos.units) * pos.cost;
    await tx.position.update({
      where: { userId_slug_weighting: { userId, slug, weighting } },
      data: {
        units: pos.units - units,
        cost: pos.cost - costReduction,
      },
    });

    const proceeds = units * spot;
    await tx.user.update({
      where: { id: userId },
      data: { cash: { increment: proceeds } },
    });
    await tx.trade.create({
      data: {
        userId,
        slug,
        weighting,
        side: "sell",
        units,
        price: spot,
        amount: proceeds,
        ts: BigInt(Date.now()),
      },
    });
    return true;
  });

  return ran ? { ok: true } : { ok: false, error: "You don't hold that many units." };
}
