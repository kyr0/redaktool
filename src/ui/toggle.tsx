import * as React from "react"
import * as TogglePrimitive from "@radix-ui/react-toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/content-script/utils"

const toggleVariants = cva(
  "ab-inline-flex ab-items-center ab-justify-center ab-rounded-md ab-text-sm ab-font-medium ab-ring-offset-background ab-transition-colors hover:ab-bg-muted hover:ab-text-muted-foreground focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-pointer-events-none disabled:ab-opacity-50 data-[state=on]:ab-bg-accent data-[state=on]:ab-text-accent-foreground",
  {
    variants: {
      variant: {
        default: "ab-bg-transparent",
        outline:
          "ab-border ab-border-input ab-bg-transparent hover:ab-bg-accent hover:ab-text-accent-foreground",
      },
      size: {
        default: "ab-h-10 ab-px-3",
        sm: "ab-h-9 ab-px-2.5",
        lg: "ab-h-11 ab-px-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root
    ref={ref}
    className={cn(toggleVariants({ variant, size, className }))}
    {...props}
  />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
