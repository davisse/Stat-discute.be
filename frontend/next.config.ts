import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  // This creates a minimal production build with only necessary files
  output: "standalone",

  // Enable Next.js image optimization
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 2592000, // 30 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.nba.com',
        pathname: '/logos/**',
      },
    ],
  },

  // Environment variables validation (optional)
  env: {
    // Expose non-sensitive env vars to client if needed
  },

  // Turbopack configuration to prevent scanning outside frontend directory
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
