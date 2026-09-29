import type { NextConfig } from "next";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/Morpheus" : "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  outputFileTracingRoot: process.cwd(),
  images: {
    unoptimized: true,
    formats: ["image/webp"],
    qualities: [75, 90, 92],
  },
};

export default nextConfig;