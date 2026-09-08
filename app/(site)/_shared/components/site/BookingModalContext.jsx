"use client";

import { createContext, useContext, useMemo, useState, useCallback } from "react";

/**
 * `Navbar` and `Footer` are siblings under `SiteShell`, not parent/child,
 * but both need to open the same "Book a Call" modal instance - this
 * codebase has no global state library, so a small dedicated context is
 * the minimal way to share one open/close/prefill state across them.
 */
const BookingModalCtx = createContext(null);

export function BookingModalProvider({ children }) {
  const [open, setOpen] = useState(false);

  const openModal = useCallback(() => setOpen(true), []);
  const closeModal = useCallback(() => setOpen(false), []);

  const value = useMemo(() => ({ open, openModal, closeModal }), [open, openModal, closeModal]);

  return <BookingModalCtx.Provider value={value}>{children}</BookingModalCtx.Provider>;
}

export function useBookingModal() {
  const ctx = useContext(BookingModalCtx);
  if (!ctx) throw new Error("useBookingModal must be used within BookingModalProvider");
  return ctx;
}
