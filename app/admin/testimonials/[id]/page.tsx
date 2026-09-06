"use client";

import { use } from "react";
import { AppShell } from "@/components/dashboard/AppShell";
import { OryCMSTestimonialFormPage } from "@/components/testimonials/OryCMSTestimonialFormPage";

export default function EditTestimonialPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  return (
    <AppShell section="Testimonials">
      <OryCMSTestimonialFormPage testimonialId={params.id} />
    </AppShell>
  );
}
