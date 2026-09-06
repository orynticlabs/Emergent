"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSBookingAvailabilityPage } from "@/components/bookings/OryCMSBookingAvailabilityPage";

export default function BookingAvailabilityPage() {
  return (
    <AppShell section="Availability">
      <OryCMSBookingAvailabilityPage />
    </AppShell>
  );
}
