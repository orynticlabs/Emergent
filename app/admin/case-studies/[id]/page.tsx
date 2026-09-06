"use client";

import { use } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSCaseStudyFormPage } from "@/components/case-studies/OryCMSCaseStudyFormPage";

export default function EditCaseStudyPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  return (
    <AppShell section="Our Work">
      <OryCMSCaseStudyFormPage caseStudyId={params.id} />
    </AppShell>
  );
}
