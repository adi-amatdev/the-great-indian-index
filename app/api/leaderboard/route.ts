import { NextRequest, NextResponse } from "next/server";
import { INDICES } from "@/lib/indices";
import { getCurrentUser } from "@/lib/auth";
import { listCustomIndexes } from "@/lib/custom-indexes";
import { getIndexData, resolveRange } from "@/lib/yahoo";
import { withRisk } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const range = resolveRange(req.nextUrl.searchParams.get("range") ?? undefined).key;
  const user = await getCurrentUser();
  const custom = user ? await listCustomIndexes(user.id) : [];
  const definitions = [...INDICES, ...custom];
  const rows = await Promise.all(definitions.map(async (def) => ({ ...withRisk(await getIndexData(def, range, def.custom ? "custom" : "equal")), custom: Boolean(def.custom) })));
  rows.sort((a, b) => (b.changePct ?? -Infinity) - (a.changePct ?? -Infinity));
  return NextResponse.json({ range, rows }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
