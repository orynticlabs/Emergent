import { Boxes } from "lucide-react";

export function DummyPlatformLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const box = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  const icon = size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4";
  const text = size === "sm" ? "text-[14px]" : "text-[16px]";

  return (
    <div className="flex items-center gap-2">
      <div className={`grid ${box} place-items-center rounded-lg bg-[var(--dp-brand)] text-[var(--dp-brand-ink)]`}>
        <Boxes className={icon} />
      </div>
      <span className={`${text} font-semibold tracking-tight text-[var(--dp-ink)]`}>
        Dummy Platform
      </span>
    </div>
  );
}
