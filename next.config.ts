import type { NextConfig } from "next";

/**
 * GitHub Pages project sites live at /<repo>/ — set BASE_PATH in CI.
 * Local/dev and user/org sites (username.github.io) leave it empty.
 */
const basePath = process.env.BASE_PATH?.replace(/\/$/, "") || "";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
};

export default nextConfig;
