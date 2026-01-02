import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  // This creates a minimal production build with only necessary files
  output: "standalone",

  // Disable image optimization for simpler deployment
  // Can be re-enabled with proper loader configuration
  images: {
    unoptimized: true,
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
