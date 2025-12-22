import type { NextConfig } from "next";
import "./src/env.ts";
const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "img.poripori.top" },
      { hostname: "oss-cn-hongkong.aliyuncs.com" },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  transpilePackages: ["@repo/contract"],
};

export default nextConfig;
