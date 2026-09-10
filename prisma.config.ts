import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Prisma 7 moved connection URLs out of schema.prisma and into this config
// file. Load local .env / .env.local explicitly if present so CLI commands
// can see DATABASE_URL / DIRECT_URL when running locally (Next.js loads them
// automatically at runtime, and cloud platforms like Vercel inject environment
// variables directly into process.env without a .env file).
for (const envFile of [".env.local", ".env"]) {
  const envPath = path.join(process.cwd(), envFile);
  if (fs.existsSync(envPath) && typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(envPath);
    } catch {
      // Ignore if file cannot be read or parsed
    }
  }
}

export default defineConfig({
  schema: path.join(process.cwd(), "prisma", "schema.prisma"),
  datasource: {
    // CLI/migration commands (generate, db push, migrate) connect directly,
    // bypassing Neon's connection pooler - pgbouncer's transaction pooling
    // doesn't support the prepared statements/DDL these commands issue.
    // The app's runtime PrismaClient uses the pooled DATABASE_URL instead,
    // via a driver adapter (see orycms/lib/prisma.ts).
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
