"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Aceternity "navbar-menu" dropdown behavior: a single shared panel
 * (layoutId) that smoothly morphs position/size as the hover target changes
 * between menu items, with continuous hover hit area and debounced leave.
 */

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export function Menu({ className = "", children }) {
  return (
    <nav className={`relative flex items-center ${className}`}>
      {children}
    </nav>
  );
}

export function MenuItem({ setActive, active, id, label, children }) {
  const itemRef = useRef(null);
  const timeoutRef = useRef(null);

  const clearPendingClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const handleButtonMouseEnter = () => {
    clearPendingClose();
    setActive(id);
  };

  const handleButtonMouseLeave = () => {
    clearPendingClose();
    timeoutRef.current = setTimeout(() => {
      setActive((current) => (current === id ? null : current));
    }, 150);
  };

  const handleSubmenuMouseEnter = () => {
    // Only maintain open state if already active. Never open from the submenu area!
    if (active === id) {
      clearPendingClose();
    }
  };

  const handleSubmenuMouseLeave = () => {
    clearPendingClose();
    timeoutRef.current = setTimeout(() => {
      setActive((current) => (current === id ? null : current));
    }, 150);
  };

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    clearPendingClose();
    setActive((current) => (current === id ? null : id));
  };

  useEffect(() => {
    const handlePointerDownOutside = (event) => {
      if (itemRef.current && !itemRef.current.contains(event.target)) {
        clearPendingClose();
        setActive((current) => (current === id ? null : current));
      }
    };

    if (active === id) {
      document.addEventListener("pointerdown", handlePointerDownOutside);
    }
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      clearPendingClose();
    };
  }, [active, id, setActive]);

  return (
    <div ref={itemRef} className="relative">
      <div
        role="button"
        tabIndex={0}
        onClick={handleButtonClick}
        onMouseEnter={handleButtonMouseEnter}
        onMouseLeave={handleButtonMouseLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleButtonClick(e);
          }
        }}
        className="cursor-pointer select-none outline-none"
      >
        {label}
      </div>

      <AnimatePresence>
        {active === id && children && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4, pointerEvents: "none" }}
            transition={transition}
            onMouseEnter={handleSubmenuMouseEnter}
            onMouseLeave={handleSubmenuMouseLeave}
            className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3"
          >
            <motion.div
              layoutId="active-submenu-panel"
              transition={transition}
              className="overflow-hidden rounded-2xl border border-white/10 bg-[#090909]/95 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
            >
              <motion.div layout className="h-full w-max">
                {children}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function HoveredLink({ children, className = "", href = "#", onClick, ...rest }) {
  return (
    <Link href={href} onClick={onClick} {...rest} className={`text-white/70 transition-colors duration-200 hover:text-brand-orange ${className}`}>
      {children}
    </Link>
  );
}

export function ProductItem({ title, description, href, src, onClick }) {
  return (
    <Link href={href} onClick={onClick} className="group flex gap-3">
      <img src={src} width={120} height={64} alt={title} loading="lazy" decoding="async" className="h-16 w-[120px] shrink-0 rounded-md object-cover shadow-lg" />
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-white transition-colors duration-200 group-hover:text-brand-orange">{title}</h4>
        <p className="mt-1 max-w-[11rem] text-xs leading-relaxed text-white/50">{description}</p>
      </div>
    </Link>
  );
}
