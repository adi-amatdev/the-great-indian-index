import { NextRequest, NextResponse } from "next/server";
import { getIndex } from "@/lib/indices";
import { getCurrentUser } from "@/lib/auth";
import { getCustomIndexForUser } from "@/lib/custom-indexes";
import {
  RangeKey,
  resolveRange,
  resolveWeighting,
} from "@/lib/yahoo";
import { getCachedIndexData } from "@/lib/index-cache";

export const revalidate = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const def = getIndex(slug) ?? (user ? await getCustomIndexForUser(user.id, slug) : null);
  if (!def) {
    return NextResponse.json({ error: "Unknown index" }, { status: 404 });
  }

  const range = resolveRange(req.nextUrl.searchParams.get("range") ?? undefined)
    .key as RangeKey;
  const weighting = resolveWeighting(req.nextUrl.searchParams.get("weighting"));

  const data = await getCachedIndexData(def, range, weighting);
  return NextResponse.json(data, {
    headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=300" },
  });
}
