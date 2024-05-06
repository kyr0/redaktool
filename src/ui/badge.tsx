import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/content-script/utils";

const badgeVariants = cva(
  "ab-inline-flex ab-items-center ab-rounded-full ab-border ab-px-2.5 ab-py-0.5 ab-text-xs ab-font-semibold ab-transition-colors focus:ab-outline-none focus:ab-ring-2 focus:ab-ring-ring focus:ab-ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "ab-border-transparent ab-bg-primary ab-text-primary-foreground hover:ab-bg-primary/80",
        secondary:
          "ab-border-transparent ab-bg-secondary ab-text-secondary-foreground hover:ab-bg-secondary/80",
        destructive:
          "ab-border-transparent ab-bg-destructive ab-text-destructive-foreground hover:ab-bg-destructive/80",
        outline: "ab-text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
