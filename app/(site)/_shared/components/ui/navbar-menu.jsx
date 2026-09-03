"use client";

import { motion } from "framer-motion";

/**
 * Aceternity "navbar-menu" dropdown behavior: a single shared panel
 * (layoutId) that smoothly morphs position/size as the hover target changes
 * between menu items, instead of each dropdown independently fading in/out.
 */

const transition = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export function Menu({ setActive, className = "", children }) {
  return (
    <nav onMouseLeave={() => setActive(null)} className={`relative flex items-center ${className}`}>
      {children}
    </nav>
  );
}

export function MenuItem({ setActive, active, id, label, children }) {
  return (
    <div onMouseEnter={() => setActive(id)} className="relative">
      <div className="cursor-pointer">{label}</div>
      {active === id && children && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={transition}
          className="absolute left-1/2 top-[calc(100%+1.2rem)] -translate-x-1/2"
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
    </div>
  );
}

export function HoveredLink({ children, className = "", ...rest }) {
  return (
    <a {...rest} className={`text-white/70 transition-colors duration-200 hover:text-brand-orange ${className}`}>
      {children}
    </a>
  );
}

export function ProductItem({ title, description, href, src }) {
  return (
    <a href={href} className="group flex gap-3">
      <img src={src} width={120} height={64} alt={title} loading="lazy" decoding="async" className="h-16 w-[120px] shrink-0 rounded-md object-cover shadow-lg" />
      <div className="min-w-0">
        <h4 className="text-sm font-bold text-white transition-colors duration-200 group-hover:text-brand-orange">{title}</h4>
        <p className="mt-1 max-w-[11rem] text-xs leading-relaxed text-white/50">{description}</p>
      </div>
    </a>
  );
}
