"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSAnnouncementFormPage } from "@/components/announcements/OryCMSAnnouncementFormPage";

export default function NewAnnouncementPage() {
  return (
    <AppShell section="Announcement">
      <OryCMSAnnouncementFormPage />
    </AppShell>
  );
}
