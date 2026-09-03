import path from "node:path";
import { defineConfig, env } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma and into this config
// file. Load orycms/.env explicitly so `env()` below can see DATABASE_URL /
// DIRECT_URL when running `prisma` CLI commands directly (Next.js itself
// loads .env.local / .env automatically at runtime).
process.loadEnvFile(path.join(__dirname, ".env"));

export default defineConfig({
  schema: path.join(__dirname, "prisma", "schema.prisma"),
  datasource: {
    // CLI/migration commands (generate, db push, migrate) connect directly,
    // bypassing Neon's connection pooler — pgbouncer's transaction pooling
    // doesn't support the prepared statements/DDL these commands issue.
    // The app's runtime PrismaClient uses the pooled DATABASE_URL instead,
    // via a driver adapter (see orycms/lib/prisma.ts).
    url: env("DIRECT_URL"),
  },
});
