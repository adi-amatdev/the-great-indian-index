import { NextRequest, NextResponse } from "next/server";
import { INDICES } from "@/lib/indices";
import { listPublicCustomIndexes } from "@/lib/custom-indexes";
import { resolveRange } from "@/lib/yahoo";
import { getCachedIndexData } from "@/lib/index-cache";
import { withRisk } from "@/lib/analytics";

export async function GET(req: NextRequest) {
  const range = resolveRange(req.nextUrl.searchParams.get("range") ?? undefined).key;
  const page = Math.max(1, Number(req.nextUrl.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(5, Number(req.nextUrl.searchParams.get("pageSize") ?? 12) || 12));
  const custom = await listPublicCustomIndexes();
  const definitions = [...INDICES, ...custom];
  const ranked = await Promise.all(definitions.map(async (def, index) => ({ rank: index + 1, ...withRisk(await getCachedIndexData(def, range, def.custom ? "custom" : "equal")), custom: Boolean(def.custom), creatorUsername: def.creatorUsername })));
  ranked.sort((a, b) => (b.changePct ?? -Infinity) - (a.changePct ?? -Infinity));
  const rows = ranked.slice((page - 1) * pageSize, page * pageSize).map((row, index) => ({ ...row, rank: (page - 1) * pageSize + index + 1 }));
  return NextResponse.json({ range, rows, page, pageSize, total: ranked.length, totalPages: Math.ceil(ranked.length / pageSize) }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
