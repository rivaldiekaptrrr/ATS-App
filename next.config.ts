import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here - reloaded */
  output: "standalone",
  serverExternalPackages: ["pdf-parse"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },
};

export default nextConfig;
