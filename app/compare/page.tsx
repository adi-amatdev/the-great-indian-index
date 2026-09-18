import { INDICES } from "@/lib/indices";
import { BENCHMARKS } from "@/lib/benchmarks";
import { getCurrentUser } from "@/lib/auth";
import { listCustomIndexes } from "@/lib/custom-indexes";
import ComparisonWorkspace from "@/components/ComparisonWorkspace";

export const dynamic = "force-dynamic";

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ left?: string; right?: string }> }) {
  const query = await searchParams;
  const user = await getCurrentUser();
  const custom = user ? await listCustomIndexes(user.id) : [];
  return <ComparisonWorkspace options={[...INDICES, ...BENCHMARKS, ...custom]} initialLeft={query.left ?? "tata"} initialRight={query.right ?? "benchmark-nifty50"} />;
}
