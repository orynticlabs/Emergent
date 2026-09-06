"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSCompaniesAdminPage } from "@/components/companies/OryCMSCompaniesAdminPage";

export default function CompaniesPage() {
  return (
    <AppShell section="Companies">
      <OryCMSCompaniesAdminPage />
    </AppShell>
  );
}
