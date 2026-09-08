import type { Pool } from "pg";
import { getOryCMSPool } from "@/lib/db";
import { OryCMSAuthError } from "@/auth";
import { clearOryCMSPermissionCache, ORYCMS_SUPER_ADMIN_ROLE } from "@/rbac";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface OryCMSRoleRecord {
  id: string;
  name: string;
  description: string | null;
}

export interface OryCMSPermissionRecord {
  id: string;
  name: string;
  resource: string;
  action: string;
}

// ── Roles ──────────────────────────────────────────────────────────────────────

export async function listOryCMSRoles(pool: Pool = getOryCMSPool()): Promise<OryCMSRoleRecord[]> {
  const result = await pool.query<OryCMSRoleRecord>(
    `SELECT id, name, description FROM orycms_roles ORDER BY name ASC`,
  );
  return result.rows;
}

export async function getOryCMSRole(
  id: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSRoleRecord> {
  const result = await pool.query<OryCMSRoleRecord>(
    `SELECT id, name, description FROM orycms_roles WHERE id = $1 LIMIT 1`,
    [id],
  );
  const role = result.rows[0];
  if (!role) throw new OryCMSAuthError("UNAUTHORIZED", "Role not found.", 404);
  return role;
}

export async function createOryCMSRole(
  input: { name: string; description?: string | null },
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSRoleRecord> {
  try {
    const result = await pool.query<OryCMSRoleRecord>(
      `INSERT INTO orycms_roles (id, name, description)
       VALUES (gen_random_uuid(), $1, $2)
       RETURNING id, name, description`,
      [input.name, input.description ?? null],
    );
    return result.rows[0];
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      throw Object.assign(new Error(`A role named "${input.name}" already exists.`), {
        code: "VALIDATION_ERROR",
        statusCode: 422,
      });
    }
    throw err;
  }
}

export async function updateOryCMSRole(
  id: string,
  input: { name?: string; description?: string | null },
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSRoleRecord> {
  // The "Super Admin" role's name is a protected identity, not just a label:
  // orycms/auth/auth.ts and orycms/projects/projects.repo.ts both match on
  // this exact string for privilege bypasses. Renaming it away would
  // silently break that bypass for its current holders and cause the next
  // fresh-install bootstrap to create a SECOND "Super Admin" role
  // (ON CONFLICT (name) DO NOTHING no longer matches the renamed row).
  if (input.name !== undefined && input.name !== ORYCMS_SUPER_ADMIN_ROLE) {
    const current = await getOryCMSRole(id, pool);
    if (current.name === ORYCMS_SUPER_ADMIN_ROLE) {
      throw Object.assign(
        new Error(`The "${ORYCMS_SUPER_ADMIN_ROLE}" role cannot be renamed.`),
        { code: "VALIDATION_ERROR", statusCode: 422 },
      );
    }
  }

  const sets: string[] = [];
  const values: unknown[] = [];
  let i = 1;
  if (input.name !== undefined) {
    sets.push(`name = $${i++}`);
    values.push(input.name);
  }
  if (input.description !== undefined) {
    sets.push(`description = $${i++}`);
    values.push(input.description);
  }
  if (sets.length === 0) return getOryCMSRole(id, pool);

  values.push(id);
  let result;
  try {
    result = await pool.query<OryCMSRoleRecord>(
      `UPDATE orycms_roles SET ${sets.join(", ")} WHERE id = $${i}
       RETURNING id, name, description`,
      values,
    );
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      throw Object.assign(new Error(`A role named "${input.name}" already exists.`), {
        code: "VALIDATION_ERROR",
        statusCode: 422,
      });
    }
    throw err;
  }
  const role = result.rows[0];
  if (!role) throw new OryCMSAuthError("UNAUTHORIZED", "Role not found.", 404);
  clearOryCMSPermissionCache();
  return role;
}

export async function deleteOryCMSRole(id: string, pool: Pool = getOryCMSPool()): Promise<void> {
  const role = await getOryCMSRole(id, pool);

  if (role.name === ORYCMS_SUPER_ADMIN_ROLE) {
    throw Object.assign(new Error(`The "${ORYCMS_SUPER_ADMIN_ROLE}" role cannot be deleted.`), {
      code: "VALIDATION_ERROR",
      statusCode: 422,
    });
  }

  const inUse = await pool.query<{ count: string }>(
    `SELECT count(*)::text AS count FROM orycms_users WHERE "roleId" = $1`,
    [id],
  );
  if (Number(inUse.rows[0].count) > 0) {
    throw Object.assign(
      new Error(
        `This role is assigned to ${inUse.rows[0].count} user(s) - reassign them before deleting it.`,
      ),
      { code: "VALIDATION_ERROR", statusCode: 422 },
    );
  }

  await pool.query(`DELETE FROM orycms_roles WHERE id = $1`, [id]);
  clearOryCMSPermissionCache();
}

// ── Role ↔ permission assignment ────────────────────────────────────────────────

/**
 * Resolves a set of permission ids to their {resource, action} records -
 * used by the roles/:id/permissions route to (a) reject ids that don't
 * exist and (b) check the requesting caller isn't granting a permission
 * they don't themselves hold (see that route for the ceiling check).
 */
export async function getOryCMSPermissionsByIds(
  ids: string[],
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSPermissionRecord[]> {
  if (ids.length === 0) return [];
  const result = await pool.query<OryCMSPermissionRecord>(
    `SELECT id, name, resource, action FROM orycms_permissions WHERE id = ANY($1::uuid[])`,
    [ids],
  );
  return result.rows;
}

export async function getOryCMSRolePermissions(
  roleId: string,
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSPermissionRecord[]> {
  const result = await pool.query<OryCMSPermissionRecord>(
    `SELECT p.id, p.name, p.resource, p.action
     FROM orycms_permissions p
     JOIN orycms_role_permissions rp ON rp."permissionId" = p.id
     WHERE rp."roleId" = $1
     ORDER BY p.resource, p.action`,
    [roleId],
  );
  return result.rows;
}

/**
 * Replace the full permission set for a role. Deletes existing assignments,
 * then inserts the given permission ids. Clears the RBAC cache so the change
 * takes effect immediately.
 */
export async function setOryCMSRolePermissions(
  roleId: string,
  permissionIds: string[],
  pool: Pool = getOryCMSPool(),
): Promise<void> {
  await pool.query(`DELETE FROM orycms_role_permissions WHERE "roleId" = $1`, [roleId]);
  for (const permissionId of permissionIds) {
    await pool.query(
      `INSERT INTO orycms_role_permissions ("roleId", "permissionId")
       SELECT $1, $2
       WHERE NOT EXISTS (
         SELECT 1 FROM orycms_role_permissions WHERE "roleId" = $1 AND "permissionId" = $2
       )`,
      [roleId, permissionId],
    );
  }
  clearOryCMSPermissionCache();
}

export async function listOryCMSPermissions(
  pool: Pool = getOryCMSPool(),
): Promise<OryCMSPermissionRecord[]> {
  const result = await pool.query<OryCMSPermissionRecord>(
    `SELECT id, name, resource, action FROM orycms_permissions ORDER BY resource, action`,
  );
  return result.rows;
}
