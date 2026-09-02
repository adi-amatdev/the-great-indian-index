import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma resolves the Postgres/Neon connection at runtime in server code.
  serverExternalPackages: ["@prisma/client", "@prisma/engines"],
};

export default nextConfig;
