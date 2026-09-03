import "dotenv/config";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.ORYCMS_DATABASE_URL || process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const M = ["manage"];
const CRUD = ["create", "read", "update", "delete"];
const CRUDP = ["create", "read", "update", "delete", "publish"];

const ORYCMS_DEFAULT_PERMISSIONS = {
  "Super Admin": { collections: M, content: M, media: M, users: M, roles: M, projects: M, clients: M, plugins: M, settings: M, migrations: M, seo: M, audit: M, ai: M, announcements: M, companies: M },
  Admin: { collections: M, content: M, media: M, users: CRUD, roles: ["read"], projects: M, clients: M, plugins: M, settings: M, migrations: M, seo: M, audit: ["read"], ai: M, announcements: M, companies: M },
  Editor: { collections: ["read"], content: CRUDP, media: CRUD, users: ["read"], projects: CRUD, clients: CRUD, seo: CRUD, ai: ["read"], announcements: CRUD, companies: CRUD },
  Author: { collections: ["read"], content: ["create", "read", "update"], media: ["create", "read"], projects: ["read", "update"], clients: ["read"], ai: ["read"], announcements: ["read"], companies: ["read"] },
  Viewer: { collections: ["read"], content: ["read"], media: ["read"], projects: ["read"], clients: ["read"], seo: ["read"], announcements: ["read"], companies: ["read"] },
};

async function main() {
  for (const name of Object.keys(ORYCMS_DEFAULT_PERMISSIONS)) {
    await pool.query(
      `INSERT INTO orycms_roles (id, name) VALUES (gen_random_uuid(), $1) ON CONFLICT (name) DO NOTHING`,
      [name],
    );
  }

  let added = 0;
  for (const [roleName, resources] of Object.entries(ORYCMS_DEFAULT_PERMISSIONS)) {
    const roleRes = await pool.query(`SELECT id FROM orycms_roles WHERE name = $1`, [roleName]);
    const roleId = roleRes.rows[0]?.id;
    if (!roleId) continue;

    for (const [resource, actions] of Object.entries(resources)) {
      for (const action of actions) {
        const permName = `${resource}:${action}`;
        const permRes = await pool.query(
          `INSERT INTO orycms_permissions (id, name, resource, action)
           VALUES (gen_random_uuid(), $1, $2, $3)
           ON CONFLICT (name) DO UPDATE SET resource = EXCLUDED.resource, action = EXCLUDED.action
           RETURNING id`,
          [permName, resource, action],
        );
        const permId = permRes.rows[0]?.id;
        if (!permId) continue;

        const ins = await pool.query(
          `INSERT INTO orycms_role_permissions ("roleId", "permissionId")
           SELECT $1, $2
           WHERE NOT EXISTS (
             SELECT 1 FROM orycms_role_permissions WHERE "roleId" = $1 AND "permissionId" = $2
           )`,
          [roleId, permId],
        );
        added += ins.rowCount;
      }
    }
  }
  console.log("New role-permission links added:", added);

  const check = await pool.query(`
    SELECT r.name AS role, p.resource, p.action
    FROM orycms_role_permissions rp
    JOIN orycms_roles r ON r.id = rp."roleId"
    JOIN orycms_permissions p ON p.id = rp."permissionId"
    WHERE p.resource = 'companies'
    ORDER BY r.name, p.action;
  `);
  console.log("Roles with 'clients' permission now:");
  console.table(check.rows);
}

main().then(() => pool.end()).catch((e) => { console.error(e); pool.end(); process.exit(1); });
