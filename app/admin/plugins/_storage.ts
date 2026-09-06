"use client";

import { useEffect, useState } from "react";
import type { IntegrationStatus } from "./_data";

const STORAGE_PREFIX = "orycms.integration.";

function readStatus(slug: string, fallback: IntegrationStatus): IntegrationStatus {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(STORAGE_PREFIX + slug);
  return stored === "connected" || stored === "not_connected" || stored === "attention"
    ? stored
    : fallback;
}

/** Connection status persisted in localStorage, seeded from the mock default and updated live by the connect/disconnect flow. */
export function useIntegrationStatus(slug: string, fallback: IntegrationStatus) {
  const [status, setStatusState] = useState<IntegrationStatus>(fallback);

  useEffect(() => {
    setStatusState(readStatus(slug, fallback));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const setStatus = (next: IntegrationStatus) => {
    setStatusState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_PREFIX + slug, next);
    }
  };

  return [status, setStatus] as const;
}
