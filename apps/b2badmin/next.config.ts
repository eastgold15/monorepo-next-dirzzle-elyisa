import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "img.poripori.top" },
    ],
  },
  // 解决 rimraf 包的警告
  serverExternalPackages: ["rimraf"],

};

export default nextConfig;
