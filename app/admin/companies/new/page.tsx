"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSCompanyFormPage } from "@/components/companies/OryCMSCompanyFormPage";

export default function NewCompanyPage() {
  return (
    <AppShell section="Companies">
      <OryCMSCompanyFormPage />
    </AppShell>
  );
}
