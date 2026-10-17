import type { NextConfig } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    if (!API_URL) return [];
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_URL}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
