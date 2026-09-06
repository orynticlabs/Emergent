"use client";

import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSTestimonialFormPage } from "@/components/testimonials/OryCMSTestimonialFormPage";

export default function NewTestimonialPage() {
  return (
    <AppShell section="Testimonials">
      <OryCMSTestimonialFormPage />
    </AppShell>
  );
}
