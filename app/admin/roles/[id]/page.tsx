"use client";

import { use } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSRoleFormPage } from "@/components/roles/OryCMSRolesAdminPage";

export default function RoleDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  return (
    <AppShell section="Roles">
      <OryCMSRoleFormPage roleId={params.id} />
    </AppShell>
  );
}
