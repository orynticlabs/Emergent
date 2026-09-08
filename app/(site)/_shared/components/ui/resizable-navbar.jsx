"use client";

import { useRef, useState, isValidElement, cloneElement, Children } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@site/lib/utils";

/**
 * Aceternity-style "resizable" navbar: the desktop bar shrinks into a
 * floating, blurred pill once the page scrolls past a threshold. Adapted for
 * this site's always-dark brand theme (brand-ink / brand-orange) instead of
 * the default light/dark toggle.
 */

export function Navbar({ children, className }) {
  const ref = useRef(null);
  const { scrollY } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setVisible(latest > 80);
  });

  return (
    <div ref={ref} className={cn("fixed inset-x-0 top-0 z-50 w-full", className)}>
      {Children.map(children, (child) => (isValidElement(child) ? cloneElement(child, { visible }) : child))}
    </div>
  );
}

export function NavBody({ children, className, visible, ...props }) {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "none",
        boxShadow: visible ? "0 8px 40px -8px rgba(0,0,0,0.55)" : "none",
        width: visible ? "min(1232px, 96%)" : "100%",
        y: visible ? 6 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full border border-transparent bg-transparent px-4 py-2 lg:flex",
        visible && "border-white/10 bg-brand-ink/85 py-3",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function NavbarLogo({ children }) {
  return <div className="relative z-20 flex shrink-0 items-center">{children}</div>;
}

export function NavbarButton({ href = "#", as, children, className, variant = "primary", ...props }) {
  const Tag = as ?? Link;
  const isButton = as === "button";
  const base =
    "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition-all duration-300 cursor-pointer select-none";
  const variants = {
    primary: "bg-brand-orange text-white hover:bg-[#e04a00]",
    secondary: "border border-white/15 text-white/80 hover:border-white/30 hover:text-white",
  };
  return (
    <Tag
      {...(!isButton ? { href } : {})}
      className={cn(base, variants[variant], className)}
      {...props}
    >
      {children}
    </Tag>
  );
}

export function MobileNav({ children, className, visible }) {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(16px)" : "none",
        boxShadow: visible ? "0 8px 40px -8px rgba(0,0,0,0.55)" : "none",
        width: visible ? "98%" : "100%",
        borderRadius: visible ? "24px" : "0px",
        y: visible ? 6 : 0,
      }}
      transition={{ type: "spring", stiffness: 200, damping: 50 }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-1.5rem)] flex-col items-center justify-between bg-transparent px-4 py-2.5 lg:hidden",
        visible && "border border-white/10 bg-brand-ink/90",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

export function MobileNavHeader({ children, className }) {
  return <div className={cn("flex w-full flex-row items-center justify-between", className)}>{children}</div>;
}

export function MobileNavToggle({ isOpen, onClick }) {
  return (
    <button onClick={onClick} aria-label="Toggle menu" className="text-white">
      {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
    </button>
  );
}

export function MobileNavMenu({ children, className, isOpen }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          data-lenis-prevent
          className={cn(
            "absolute inset-x-0 top-full z-50 mt-2 flex max-h-[75vh] w-full flex-col items-start justify-start gap-1 overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-brand-ink/95 px-5 py-6 shadow-[0_24px_60px_-16px_rgba(0,0,0,0.7)] backdrop-blur-2xl",
            className,
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
