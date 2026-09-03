"use client";

import { toast } from "sonner";
import { CircleCheckIcon, CircleAlertIcon, XIcon } from "lucide-react";
import { Alert, AlertTitle, AlertDescription, AlertAction } from "@site/components/ui/alert";

/**
 * Renders our brand Alert (icon + title + description + close) as the body
 * of a sonner toast, so site notifications get the richer card look instead
 * of sonner's default compact toast — without touching OryCMS's own toaster.
 */
export function siteAlertToast({ title, description, variant = "success" }) {
  const Icon = variant === "error" ? CircleAlertIcon : CircleCheckIcon;

  return toast.custom(
    (id) => (
      <Alert variant="brand" className="w-[min(92vw,26rem)] shadow-xl">
        <Icon />
        <AlertTitle>{title}</AlertTitle>
        {description && <AlertDescription className="text-primary-foreground/80">{description}</AlertDescription>}
        <AlertAction>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => toast.dismiss(id)}
            className="cursor-pointer text-primary-foreground/70 transition-colors duration-200 hover:text-primary-foreground"
          >
            <XIcon className="size-4" />
          </button>
        </AlertAction>
      </Alert>
    ),
    { duration: 5000 }
  );
}
