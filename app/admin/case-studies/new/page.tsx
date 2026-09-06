"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSCaseStudyFormPage } from "@/components/case-studies/OryCMSCaseStudyFormPage";

export default function NewCaseStudyPage() {
  return (
    <AppShell section="Our Work">
      <OryCMSCaseStudyFormPage />
    </AppShell>
  );
}
