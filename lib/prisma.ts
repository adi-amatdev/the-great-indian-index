import "server-only";
import { PrismaClient } from "@prisma/client";

// Reuse a single PrismaClient across hot reloads in dev and across serverless
// invocations in production.
const globalForPrisma = globalThis as unknown as {
  __prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.__prisma = prisma;
