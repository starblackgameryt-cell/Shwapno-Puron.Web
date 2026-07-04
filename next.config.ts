import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles Next.js natively — no standalone output needed.
  // (standalone is only for self-hosted Docker/Node deployments)
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
