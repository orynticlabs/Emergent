import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@site/lib/utils"

const alertVariants = cva(
  "relative grid w-full grid-cols-[0_1fr_auto] items-start gap-x-3 gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[1.25rem_1fr_auto] [&>svg]:mt-0.5 [&>svg]:size-5 [&>svg]:text-current",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        brand: "border-none bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props} />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("col-start-2 line-clamp-1 min-h-5 font-medium leading-tight tracking-tight", className)}
    {...props} />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("col-start-2 text-sm [&_p]:leading-relaxed", className)}
    {...props} />
))
AlertDescription.displayName = "AlertDescription"

const AlertAction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("col-start-3 row-span-2 row-start-1 self-start justify-self-end", className)}
    {...props} />
))
AlertAction.displayName = "AlertAction"

export { Alert, AlertTitle, AlertDescription, AlertAction }
