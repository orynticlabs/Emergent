import type { NextRequest } from "next/server";
import { getOryCMSPool } from "@/lib/db";
import { ORYCMS_DEFAULT_PERMISSIONS } from "@/rbac";
import { listOryCMSAuditLogs } from "@/audit";
import { guardOryCMS, toErrorResponse, oryJsonOk } from "@/lib/route-guards";

interface ConnectionInfo {
  ok: boolean;
  latencyMs: number | null;
  version: string | null;
  error: string | null;
}

interface PoolInfo {
  total: number;
  idle: number;
  waiting: number;
  max: number;
}

interface OryCMSWarning {
  level: "warning" | "info";
  message: string;
}

/** Every "<resource>:<action>" pair the code's default permission matrix expects to exist. */
function expectedPermissionNames(): Set<string> {
  const names = new Set<string>();
  for (const resources of Object.values(ORYCMS_DEFAULT_PERMISSIONS)) {
    for (const [resource, actions] of Object.entries(resources)) {
      for (const action of actions) names.add(`${resource}:${action}`);
    }
  }
  return names;
}

// GET /api/orycms/database/health - connection status, pool stats, permission-drift
// warnings, and recent migration activity, in one call for the Database dashboard.
export async function GET(request: NextRequest) {
  try {
    await guardOryCMS(request, "migrations", "read");
    const pool = getOryCMSPool();

    const connection: ConnectionInfo = { ok: false, latencyMs: null, version: null, error: null };
    const start = Date.now();
    try {
      const result = await pool.query<{ version: string }>("SELECT version()");
      connection.ok = true;
      connection.latencyMs = Date.now() - start;
      connection.version = result.rows[0]?.version.split(",")[0] ?? null;
    } catch (err) {
      connection.error = err instanceof Error ? err.message : "Connection failed.";
    }

    const poolInfo: PoolInfo = {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
      max: (pool.options as { max?: number }).max ?? 10,
    };

    const warnings: OryCMSWarning[] = [];

    if (connection.ok) {
      try {
        const expected = expectedPermissionNames();
        const existing = await pool.query<{ name: string }>(`SELECT name FROM orycms_permissions`);
        const existingNames = new Set(existing.rows.map((r) => r.name));
        const missing = [...expected].filter((name) => !existingNames.has(name));
        if (missing.length > 0) {
          warnings.push({
            level: "warning",
            message: `${missing.length} permission${missing.length === 1 ? "" : "s"} defined in code ${
              missing.length === 1 ? "has" : "have"
            } not been synced to the database yet (${missing.slice(0, 6).join(", ")}${missing.length > 6 ? ", …" : ""}). Run migrations to fix.`,
          });
        }
      } catch {
        warnings.push({ level: "warning", message: "Core tables aren't installed yet - run migrations to install the schema." });
      }

      if (poolInfo.waiting > 0) {
        warnings.push({ level: "warning", message: `${poolInfo.waiting} query${poolInfo.waiting === 1 ? " is" : "s are"} waiting on a free connection - the pool may be undersized for current load.` });
      }
      if (poolInfo.max > 0 && poolInfo.total >= poolInfo.max) {
        warnings.push({ level: "info", message: `Connection pool is at capacity (${poolInfo.total}/${poolInfo.max}).` });
      }
    } else {
      warnings.push({ level: "warning", message: "Could not reach the database - check ORYCMS_DATABASE_URL." });
    }

    let activity: Awaited<ReturnType<typeof listOryCMSAuditLogs>> = [];
    try {
      activity = await listOryCMSAuditLogs({ resource: "migrations", limit: 10 });
    } catch {
      activity = [];
    }

    return oryJsonOk({ connection, pool: poolInfo, warnings, activity });
  } catch (err) {
    return toErrorResponse(err);
  }
}
