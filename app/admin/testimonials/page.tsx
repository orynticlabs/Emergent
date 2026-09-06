"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSTestimonialsAdminPage } from "@/components/testimonials/OryCMSTestimonialsAdminPage";

export default function TestimonialsPage() {
  return (
    <AppShell section="Testimonials">
      <OryCMSTestimonialsAdminPage />
    </AppShell>
  );
}
