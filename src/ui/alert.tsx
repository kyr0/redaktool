import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/content-script/utils";

const alertVariants = cva(
  "ab-relative ab-w-full ab-rounded-lg ab-border ab-p-4 [&>svg~*]:ab-pl-7 [&>svg+div]:ab-translate-y-[-3px] [&>svg]:ab-absolute [&>svg]:ab-left-4 [&>svg]:ab-top-4 [&>svg]:ab-text-foreground",
  {
    variants: {
      variant: {
        default: "ab-bg-background ab-text-foreground",
        destructive:
          "ab-border-destructive/50 ab-text-destructive dark:ab-border-destructive [&>svg]:ab-text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "ab-mb-1 ab-font-medium ab-leading-none ab-tracking-tight",
      className,
    )}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("ab-text-sm [&_p]:ab-leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
