import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Toujours reutiliser la meme instance (build Next.js + serveur Node cPanel).
// Sans cela, chaque import cree un moteur Prisma/tokio supplementaire → EAGAIN.
globalForPrisma.prisma = prisma;
