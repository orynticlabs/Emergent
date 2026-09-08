"use client";

import { useEffect, useState } from "react";

/**
 * Normalizes an OryCMS case-study record (imageUrl/description) to the shape
 * the marketing site's project cards expect (image/desc).
 */
function normalize(record) {
  return {
    ...record,
    image: record.imageUrl,
    desc: record.description,
  };
}

/** Fetches live, active case studies from OryCMS for the marketing site. */
export function useCaseStudies() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Relative path - this API route is served by this same Next.js app.
    fetch(`/api/orycms/case-studies/public`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(`Case studies fetch failed: ${res.status}`);
        return res.json();
      })
      .then((body) => {
        if (cancelled || !body?.success || !Array.isArray(body.data)) return;
        setCaseStudies(body.data.map(normalize));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { caseStudies, loading };
}
