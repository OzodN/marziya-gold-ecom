import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  images: {
    loader: "custom",
    loaderFile: "./src/imageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.marziyagold.uz",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
    ],
  },
};

export default nextConfig;
