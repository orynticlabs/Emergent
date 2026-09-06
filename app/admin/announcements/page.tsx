"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSAnnouncementsAdminPage } from "@/components/announcements/OryCMSAnnouncementsAdminPage";

export default function AnnouncementsPage() {
  return (
    <AppShell section="Announcement">
      <OryCMSAnnouncementsAdminPage />
    </AppShell>
  );
}
