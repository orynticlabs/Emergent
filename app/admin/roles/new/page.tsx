"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSRoleFormPage } from "@/components/roles/OryCMSRolesAdminPage";

export default function NewRolePage() {
  return (
    <AppShell section="Roles">
      <OryCMSRoleFormPage />
    </AppShell>
  );
}
