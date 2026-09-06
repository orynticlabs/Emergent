import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Global singleton so hot-reload in dev doesn't open a new pool per edit —
// mirrors the pattern already used for the raw `pg` pool in ./db.ts.
const g = globalThis as { _oryPrisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  return new PrismaClient({ adapter });
}

export const prisma = g._oryPrisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  g._oryPrisma = prisma;
}
