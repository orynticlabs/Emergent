"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSBookingsAdminPage } from "@/components/bookings/OryCMSBookingsAdminPage";

export default function BookingsPage() {
  return (
    <AppShell section="Bookings">
      <OryCMSBookingsAdminPage />
    </AppShell>
  );
}
