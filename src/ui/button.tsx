import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/content-script/utils";

const buttonVariants = cva(
  "ab-inline-flex ab-items-center ab-justify-center ab-whitespace-nowrap ab-rounded-md ab-text-sm ab-font-medium ab-ring-offset-background ab-transition-colors focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-pointer-events-none disabled:ab-opacity-50",
  {
    variants: {
      variant: {
        default: "ab-ftr-button hover:ab-bg-primary/90",
        destructive:
          "ab-bg-destructive ab-text-destructive-foreground hover:ab-bg-destructive/90",
        outline:
          "ab-border ab-border-input ab-bg-background hover:ab-bg-accent hover:ab-text-accent-foreground",
        secondary:
          "ab-bg-secondary ab-text-secondary-foreground hover:ab-bg-secondary/80",
        ghost: "hover:ab-bg-accent hover:ab-text-accent-foreground",
        link: "ab-text-primary ab-underline-offset-4 hover:ab-underline",
      },
      size: {
        default: "ab-h-10 ab-px-4 ab-py-2",
        sm: "ab-h-9 ab-rounded-md ab-px-3",
        lg: "ab-h-11 ab-rounded-md ab-px-8",
        icon: "ab-h-10 ab-w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(
          "hover:!ab-bg-primary-foreground",
          buttonVariants({ variant, size, className }),
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
