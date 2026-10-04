import { NextRequest, NextResponse } from "next/server";
import { INDICES } from "@/lib/indices";
import { getCurrentUser } from "@/lib/auth";
import { listCustomIndexes } from "@/lib/custom-indexes";
import { resolveRange } from "@/lib/yahoo";
import { getCachedIndexData } from "@/lib/index-cache";
import { withRisk } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const range = resolveRange(req.nextUrl.searchParams.get("range") ?? undefined).key;
  const user = await getCurrentUser();
  const custom = user ? await listCustomIndexes(user.id) : [];
  const definitions = [...INDICES, ...custom];
  const rows = await Promise.all(definitions.map(async (def) => ({ ...withRisk(await getCachedIndexData(def, range, def.custom ? "custom" : "equal")), custom: Boolean(def.custom), creatorUsername: def.creatorUsername })));
  rows.sort((a, b) => (b.changePct ?? -Infinity) - (a.changePct ?? -Infinity));
  return NextResponse.json({ range, rows }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
