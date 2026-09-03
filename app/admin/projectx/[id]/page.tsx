"use client";

import { use } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSProjectDetailPage } from "@/components/projects/OryCMSProjectDetailPage";

export default function ProjectXDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  return (
    <AppShell section="ProjectX">
      <OryCMSProjectDetailPage projectId={params.id} />
    </AppShell>
  );
}
