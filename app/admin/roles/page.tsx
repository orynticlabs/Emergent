"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSRolesListPage } from "@/components/roles/OryCMSRolesAdminPage";

export default function RolesPage() {
  return (
    <AppShell section="Roles">
      <OryCMSRolesListPage />
    </AppShell>
  );
}
