"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSClientsAdminPage } from "@/components/clients/OryCMSClientsAdminPage";

export default function ClientsPage() {
  return (
    <AppShell section="Clients">
      <OryCMSClientsAdminPage />
    </AppShell>
  );
}
