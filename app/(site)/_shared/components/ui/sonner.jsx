"use client";

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-[#0d0d12]/95 group-[.toaster]:backdrop-blur-2xl group-[.toaster]:text-white group-[.toaster]:border-white/12 group-[.toaster]:shadow-[0_20px_50px_rgba(0,0,0,0.85)] group-[.toaster]:rounded-2xl",
          description: "group-[.toast]:text-white/60",
          actionButton:
            "group-[.toast]:bg-brand-orange group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-white/10 group-[.toast]:text-white",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
