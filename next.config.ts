import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Packages natifs / binaires Prisma — requis pour cPanel et hebergement Node.js
  serverExternalPackages: ["@prisma/client", "bcryptjs", "sharp"],
  // Hebergement mutualise (cPanel) : limite de threads/proc — 1 worker max
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
};

export default nextConfig;
