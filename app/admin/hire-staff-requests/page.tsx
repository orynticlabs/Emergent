"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSHireStaffRequestsAdminPage } from "@/components/hire-staff/OryCMSHireStaffRequestsAdminPage";

export default function HireStaffRequestsPage() {
  return (
    <AppShell section="Hire Staff Requests">
      <OryCMSHireStaffRequestsAdminPage />
    </AppShell>
  );
}
