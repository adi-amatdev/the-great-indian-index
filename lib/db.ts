import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { D1Database } from "@cloudflare/workers-types";

export const STARTING_CASH = 1_000_000; // ₹10,00,000 of paper money

/**
 * The D1 database binding (see wrangler.jsonc). Available both in production on
 * Cloudflare and in local `next dev` (miniflare provides a local D1), thanks to
 * initOpenNextCloudflareForDev() in next.config.ts.
 */
export function getDB(): D1Database {
  return getCloudflareContext().env.DB;
}

// ---- Row types --------------------------------------------------------------

export type UserRow = {
  id: number;
  username: string;
  pass_hash: string;
  cash: number;
  created_at: number;
};

export type PositionRow = {
  user_id: number;
  slug: string;
  weighting: string;
  units: number;
  cost: number;
};

export type TradeRow = {
  id: number;
  user_id: number;
  slug: string;
  weighting: string;
  side: string;
  units: number;
  price: number;
  amount: number;
  ts: number;
};
