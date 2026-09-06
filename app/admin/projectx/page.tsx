"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSProjectsAdminPage } from "@/components/projects/OryCMSProjectsAdminPage";

export default function ProjectXPage() {
  return (
    <AppShell section="ProjectX">
      <OryCMSProjectsAdminPage />
    </AppShell>
  );
}
