import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/admin";
import PageHeader from "@/components/ui/PageHeader";
import StatCard from "@/components/ui/StatCard";
import AdminUserDirectory from "@/components/AdminUserDirectory";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin - Bharat Indexes" };

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) redirect("/");
  const [users, indexes, invites, trades, cache, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.customIndex.count(),
    prisma.customIndexInvite.count({ where: { status: "pending" } }),
    prisma.trade.count(),
    prisma.indexCache.count(),
    prisma.user.findMany({ select: { username: true, email: true, bio: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 100 }),
  ]);
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-5 sm:py-12">
      <PageHeader eyebrow="Admin console" title="Bharat Indexes operations" description="Private signup, portfolio, collaboration, cache, and index activity overview." />
      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Users" value={users} />
        <StatCard label="Custom indexes" value={indexes} />
        <StatCard label="Pending invites" value={invites} />
        <StatCard label="Trades" value={trades} />
        <StatCard label="Cache rows" value={cache} />
      </section>
      <AdminUserDirectory users={recentUsers.map((row) => ({ ...row, createdAt: Number(row.createdAt) }))} />
    </main>
  );
}
