import "server-only";
import { getDB, PositionRow, TradeRow } from "./db";

export type TradeResult = { ok: true } | { ok: false; error: string };

export async function getPosition(
  userId: number,
  slug: string,
  weighting: string,
): Promise<PositionRow | null> {
  return await getDB()
    .prepare(
      "SELECT * FROM positions WHERE user_id = ? AND slug = ? AND weighting = ?",
    )
    .bind(userId, slug, weighting)
    .first<PositionRow>();
}

export async function getAllPositions(userId: number): Promise<PositionRow[]> {
  const res = await getDB()
    .prepare(
      "SELECT * FROM positions WHERE user_id = ? AND units > 0.0000001 ORDER BY slug",
    )
    .bind(userId)
    .all<PositionRow>();
  return res.results ?? [];
}

export async function getTrades(userId: number, limit = 50): Promise<TradeRow[]> {
  const res = await getDB()
    .prepare("SELECT * FROM trades WHERE user_id = ? ORDER BY ts DESC LIMIT ?")
    .bind(userId, limit)
    .all<TradeRow>();
  return res.results ?? [];
}

export async function buy(
  userId: number,
  slug: string,
  weighting: string,
  amount: number,
  spot: number,
): Promise<TradeResult> {
  if (!(amount > 0)) return { ok: false, error: "Enter a positive amount." };
  if (!(spot > 0)) return { ok: false, error: "Price unavailable right now." };

  const db = getDB();
  // Atomic, race-safe cash deduction: only succeeds if the balance covers it.
  const deduct = await db
    .prepare("UPDATE users SET cash = cash - ?1 WHERE id = ?2 AND cash >= ?1")
    .bind(amount, userId)
    .run();
  if (deduct.meta.changes !== 1)
    return { ok: false, error: "Not enough cash for that amount." };

  const units = amount / spot;
  await db.batch([
    db
      .prepare(
        `INSERT INTO positions (user_id, slug, weighting, units, cost)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT(user_id, slug, weighting)
         DO UPDATE SET units = units + excluded.units, cost = cost + excluded.cost`,
      )
      .bind(userId, slug, weighting, units, amount),
    db
      .prepare(
        `INSERT INTO trades (user_id, slug, weighting, side, units, price, amount, ts)
         VALUES (?, ?, ?, 'buy', ?, ?, ?, ?)`,
      )
      .bind(userId, slug, weighting, units, spot, amount, Date.now()),
  ]);
  return { ok: true };
}

export async function sell(
  userId: number,
  slug: string,
  weighting: string,
  units: number,
  spot: number,
): Promise<TradeResult> {
  if (!(units > 0))
    return { ok: false, error: "Enter a positive number of units." };
  if (!(spot > 0)) return { ok: false, error: "Price unavailable right now." };

  const db = getDB();
  // Reduce units and cost basis proportionally, in one guarded statement.
  // SQLite evaluates all RHS expressions against the pre-update row, so
  // `cost * (1 - ?1/units)` uses the original units. Only runs if enough held.
  const reduce = await db
    .prepare(
      `UPDATE positions
         SET cost = cost * (1 - ?1 / units), units = units - ?1
       WHERE user_id = ?2 AND slug = ?3 AND weighting = ?4 AND units >= ?1`,
    )
    .bind(units, userId, slug, weighting)
    .run();
  if (reduce.meta.changes !== 1)
    return { ok: false, error: "You don't hold that many units." };

  const proceeds = units * spot;
  await db.batch([
    db
      .prepare("UPDATE users SET cash = cash + ? WHERE id = ?")
      .bind(proceeds, userId),
    db
      .prepare(
        `INSERT INTO trades (user_id, slug, weighting, side, units, price, amount, ts)
         VALUES (?, ?, ?, 'sell', ?, ?, ?, ?)`,
      )
      .bind(userId, slug, weighting, units, spot, proceeds, Date.now()),
  ]);
  return { ok: true };
}
