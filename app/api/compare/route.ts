import { NextRequest, NextResponse } from "next/server";
import { getIndex } from "@/lib/indices";
import { getCurrentUser } from "@/lib/auth";
import { getCustomIndexForUser } from "@/lib/custom-indexes";
import { getBenchmark } from "@/lib/benchmarks";
import { getIndexData, resolveRange, resolveWeighting, type Weighting } from "@/lib/yahoo";
import { withRisk } from "@/lib/analytics";

async function resolveDefinition(slug: string, userId: bigint | null) {
  return getIndex(slug) ?? getBenchmark(slug) ?? (userId ? getCustomIndexForUser(userId, slug) : null);
}

export async function GET(req: NextRequest) {
  const leftSlug = req.nextUrl.searchParams.get("left") ?? "tata";
  const rightSlug = req.nextUrl.searchParams.get("right") ?? "benchmark-nifty50";
  const benchmarkSlug = req.nextUrl.searchParams.get("benchmark") ?? "benchmark-nifty50";
  const range = resolveRange(req.nextUrl.searchParams.get("range") ?? undefined).key;
  const weighting = resolveWeighting(req.nextUrl.searchParams.get("weighting"));
  const user = await getCurrentUser();
  const userId = user?.id ?? null;
  const [left, right, benchmark] = await Promise.all([
    resolveDefinition(leftSlug, userId),
    resolveDefinition(rightSlug, userId),
    resolveDefinition(benchmarkSlug, userId),
  ]);
  if (!left || !right || !benchmark) return NextResponse.json({ error: "Unknown comparison item." }, { status: 404 });
  const effectiveWeighting = weighting === "custom" && !left.custom && !right.custom ? "equal" : weighting;
  const data = await Promise.all([
    getIndexData(left, range, left.custom ? "custom" : effectiveWeighting),
    getIndexData(right, range, right.custom ? "custom" : effectiveWeighting),
    getIndexData(benchmark, range, "equal"),
  ]);
  return NextResponse.json({ range, weighting: effectiveWeighting as Weighting, left: withRisk(data[0]), right: withRisk(data[1]), benchmark: withRisk(data[2]) }, { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" } });
}
