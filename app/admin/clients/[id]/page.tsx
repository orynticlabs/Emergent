"use client";

import { use } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSClientDetailPage } from "@/components/clients/OryCMSClientDetailPage";

export default function ClientDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  return (
    <AppShell section="Clients">
      <OryCMSClientDetailPage clientId={params.id} />
    </AppShell>
  );
}
