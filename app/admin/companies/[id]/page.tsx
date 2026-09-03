"use client";

import { use } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSCompanyFormPage } from "@/components/companies/OryCMSCompanyFormPage";

export default function EditCompanyPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  return (
    <AppShell section="Companies">
      <OryCMSCompanyFormPage companyId={params.id} />
    </AppShell>
  );
}
