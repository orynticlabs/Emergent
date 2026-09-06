"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSCaseStudiesAdminPage } from "@/components/case-studies/OryCMSCaseStudiesAdminPage";

export default function CaseStudiesPage() {
  return (
    <AppShell section="Case Studies">
      <OryCMSCaseStudiesAdminPage />
    </AppShell>
  );
}
