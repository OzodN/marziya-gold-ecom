import type { NextConfig } from "next";

const rawBackendUrl =
  process.env.INTERNAL_API_URL ||
  process.env.BACKEND_URL ||
  "http://127.0.0.1:8080";

const backendUrl = rawBackendUrl
  .replace(/\/api(\/v1)?\/?$/, "")
  .replace(/\/+$/, "");

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
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
