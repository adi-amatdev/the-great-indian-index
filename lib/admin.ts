import "server-only";

import type { User } from "@prisma/client";

export function isAdmin(user: Pick<User, "email"> | null): boolean {
  if (!user?.email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(user.email.toLowerCase());
}
