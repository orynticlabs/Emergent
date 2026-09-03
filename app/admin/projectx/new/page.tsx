"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSProjectFormPage } from "@/components/projects/OryCMSProjectFormPage";

export default function NewProjectPage() {
  return (
    <AppShell section="ProjectX">
      <OryCMSProjectFormPage />
    </AppShell>
  );
}
