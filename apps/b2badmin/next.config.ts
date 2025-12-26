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
  transpilePackages: [],
  serverExternalPackages: [
    "@repo/contract",
    "pino",
    "thread-stream",
    "logixlysia",
  ],
  // 禁用静态生成以避免 SSR 问题
  // output: 'standalone',
  // experimental: {
  //   // 禁用 Turbopack 的某些优化来避免构建问题
  //   optimizePackageImports: [],
  // },
};

export default nextConfig;
