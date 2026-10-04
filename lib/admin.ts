import "server-only";

import type { User } from "@prisma/client";

export function isAdmin(user: Pick<User, "username"> | null): boolean {
  if (!user?.username) return false;
  const admins = (process.env.ADMIN_USERNAMES ?? "")
    .split(",")
    .map((username) => username.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(user.username.toLowerCase());
}
