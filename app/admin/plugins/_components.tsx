import type { SimpleIcon } from "simple-icons";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type Logo = { kind: "brand"; icon: SimpleIcon } | { kind: "lucide"; icon: LucideIcon; tint: string };

/** Renders a platform's real brand mark (via simple-icons) in a tinted box, or a Lucide fallback for platforms with no published brand icon. */
export function BrandMark({ logo, className }: { logo: Logo; className?: string }) {
  if (logo.kind === "lucide") {
    const Icon = logo.icon;
    return (
      <div className={cn("grid place-items-center rounded-lg", logo.tint, className)}>
        <Icon className="h-[55%] w-[55%]" />
      </div>
    );
  }

  const { icon } = logo;
  return (
    <div
      className={cn("grid place-items-center rounded-lg", className)}
      style={{ backgroundColor: `#${icon.hex}1a` }}
      title={icon.title}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[55%] w-[55%]"
        fill={`#${icon.hex}`}
        role="img"
        aria-label={icon.title}
      >
        <path d={icon.path} />
      </svg>
    </div>
  );
}
