"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import Navbar from "@site/components/site/Navbar";
import Footer from "@site/components/site/Footer";
import BuildTogetherCTA from "@site/components/site/BuildTogetherCTA";
import { BookingModalProvider } from "@site/components/site/BookingModalContext";
import BookACallModal from "@site/components/site/BookACallModal";
import { Toaster } from "@site/components/ui/sonner";

const SmoothScroll = ({ children }) => {
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      allowNestedScroll: true,
      prevent: (node) => {
        return (
          node.hasAttribute("data-lenis-prevent") ||
          Boolean(node.closest("[data-lenis-prevent]")) ||
          Boolean(node.closest("[role='dialog']")) ||
          Boolean(node.closest("[role='listbox']")) ||
          Boolean(node.closest("[data-radix-popper-content-wrapper]"))
        );
      },
    });
    window.__lenis = lenis;
    let raf;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  useEffect(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return children;
};

export default function SiteShell({ children }) {
  return (
    <div className="App" data-testid="app-root">
      <div className="noise-overlay" aria-hidden="true" />
      <SmoothScroll>
        <BookingModalProvider>
          <Navbar />
          {children}
          <BuildTogetherCTA />
          <Footer />
          <BookACallModal />
        </BookingModalProvider>
        <Toaster position="bottom-right" theme="dark" richColors />
      </SmoothScroll>
    </div>
  );
}
