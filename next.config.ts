import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Packages natifs / binaires Prisma — requis pour cPanel et hebergement Node.js
  serverExternalPackages: ["@prisma/client", "bcryptjs", "sharp"],
};

export default nextConfig;
