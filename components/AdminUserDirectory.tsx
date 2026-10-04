"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type UserRow = { username: string; email: string | null; bio: string | null; createdAt: number };

export default function AdminUserDirectory({ users }: { users: UserRow[] }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? users.filter((user) => `${user.username} ${user.email ?? ""} ${user.bio ?? ""}`.toLowerCase().includes(needle)) : users;
  }, [users, query]);
  return (
    <section className="mt-8 overflow-hidden rounded-2xl border border-surface bg-surface/40">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface bg-background/50 px-4 py-3">
        <div className="font-mono text-xs font-bold uppercase tracking-wider text-muted">Recent users</div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search username, email, bio…" aria-label="Search users" className="w-full rounded-lg border border-surface bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:border-accent sm:w-64" />
      </div>
      <div className="divide-y divide-surface/70">
        {filtered.map((row) => <Link href={`/user/${row.username}`} key={row.username} className="flex items-center justify-between gap-3 px-4 py-3 text-sm transition hover:bg-surface/30"><span><span className="font-semibold text-foreground">@{row.username}</span>{row.bio && <span className="ml-2 text-xs text-muted">{row.bio}</span>}</span><span className="font-mono text-xs text-muted">{row.email ?? "email missing"} · {new Date(row.createdAt).toLocaleDateString("en-IN")}</span></Link>)}
        {!filtered.length && <p className="p-6 text-center text-sm text-muted">No users match that search.</p>}
      </div>
    </section>
  );
}
