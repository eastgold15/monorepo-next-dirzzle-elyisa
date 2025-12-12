import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { hostname: "images.unsplash.com" },
      { hostname: "img.poripori.top" },
      { hostname: "localhost" },
      { hostname: "127.0.0.1" },
    ],
  },
  // 解决 rimraf 包的警告
  serverExternalPackages: ["rimraf"],
};

export default nextConfig;
