"use client";

import { use } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSAnnouncementFormPage } from "@/components/announcements/OryCMSAnnouncementFormPage";

export default function EditAnnouncementPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  return (
    <AppShell section="Announcement">
      <OryCMSAnnouncementFormPage announcementId={params.id} />
    </AppShell>
  );
}
