import type { NextConfig } from "next";

const config: NextConfig = {
  allowedDevOrigins: ["192.168.1.67"],
  turbopack: { root: process.cwd() },
  outputFileTracingExcludes: { "/*": ["./data/**/*", "./.env*"] },
  experimental: { serverActions: { bodySizeLimit: "9mb" } },
};

export default config;
