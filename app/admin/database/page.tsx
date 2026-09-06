"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSDatabaseAdminPage } from "@/components/database/OryCMSDatabaseAdminPage";

export default function DatabasePage() {
  return (
    <AppShell section="Database">
      <OryCMSDatabaseAdminPage />
    </AppShell>
  );
}
