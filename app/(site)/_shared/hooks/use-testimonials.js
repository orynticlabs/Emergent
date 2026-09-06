"use client";

import { useEffect, useState } from "react";

/**
 * Normalizes an OryCMS testimonial record (imageUrl) to the shape the
 * "How the studio actually works" carousel expects (image).
 */
function normalize(record) {
  return { ...record, image: record.imageUrl };
}

/** Fetches live, active testimonials from OryCMS for the marketing site. */
export function useTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Relative path — this API route is served by this same Next.js app.
    fetch(`/api/orycms/testimonials/public`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Testimonials fetch failed: ${res.status}`);
        return res.json();
      })
      .then((body) => {
        if (cancelled || !body?.success || !Array.isArray(body.data)) return;
        setTestimonials(body.data.map(normalize));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { testimonials, loading };
}
