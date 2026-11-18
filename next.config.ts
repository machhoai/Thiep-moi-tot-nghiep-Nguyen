import type { NextConfig } from "next";

const config: NextConfig = {
  turbopack: { root: process.cwd() },
  outputFileTracingExcludes: { "/*": ["./data/**/*", "./.env*"] },
  experimental: { serverActions: { bodySizeLimit: "9mb" } },
};

export default config;
