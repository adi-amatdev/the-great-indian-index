import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {};

export default nextConfig;

// Makes getCloudflareContext() (and the D1 binding) work during `next dev`
// by wiring up a local miniflare-backed environment.
initOpenNextCloudflareForDev();
