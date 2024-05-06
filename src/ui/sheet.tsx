import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";

import { cn } from "../lib/content-script/utils";

const Sheet = SheetPrimitive.Root;

const SheetTrigger = SheetPrimitive.Trigger;

const SheetClose = SheetPrimitive.Close;

const SheetPortal = SheetPrimitive.Portal;

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Overlay
    className={cn(
      "ab-fixed ab-inset-0 ab-z-50 ab-bg-background/80 ab-backdrop-blur-sm data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;

const sheetVariants = cva(
  "ab-fixed ab-z-50 ab-gap-2 ab-bg-background ab-p-2 ab-shadow-lg ab-transition ab-ease-in-out data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-duration-300 data-[state=open]:ab-duration-500",
  {
    variants: {
      side: {
        top: "ab-inset-x-0 ab-top-0 ab-border-b data-[state=closed]:ab-slide-out-to-top data-[state=open]:ab-slide-in-from-top",
        bottom:
          "ab-inset-x-0 ab-bottom-0 ab-border-t data-[state=closed]:ab-slide-out-to-bottom data-[state=open]:ab-slide-in-from-bottom",
        left: "ab-inset-y-0 ab-left-0 ab-h-full ab-w-3/4 ab-border-r data-[state=closed]:ab-slide-out-to-left data-[state=open]:ab-slide-in-from-left sm:ab-max-w-sm",
        right:
          "ab-inset-y-0 ab-right-0 ab-h-full ab-w-3/4 ab- ab-border-l data-[state=closed]:ab-slide-out-to-right data-[state=open]:ab-slide-in-from-right sm:ab-max-w-sm",
      },
    },
    defaultVariants: {
      side: "right",
    },
  },
);

interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content>,
    VariantProps<typeof sheetVariants> {}

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  SheetContentProps
>(({ side = "right", className, children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content
      ref={ref}
      className={cn(sheetVariants({ side }), className)}
      {...props}
    >
      {children}
      <SheetPrimitive.Close className="ab-absolute ab-right-4 ab-top-4 ab-rounded-sm ab-opacity-70 ab-ring-offset-background ab-transition-opacity hover:ab-opacity-100 focus:ab-outline-none focus:ab-ring-2 focus:ab-ring-ring focus:ab-ring-offset-2 disabled:ab-pointer-events-none data-[state=open]:ab-bg-secondary">
        <X className="ab-h-4 ab-w-4" />
        <span className="ab-sr-only">Close</span>
      </SheetPrimitive.Close>
    </SheetPrimitive.Content>
  </SheetPortal>
));
SheetContent.displayName = SheetPrimitive.Content.displayName;

const SheetHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "ab-flex ab-flex-col ab-space-y-2 ab-text-center sm:ab-text-left",
      className,
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "ab-flex ab-flex-col-reverse sm:ab-flex-row sm:ab-justify-end sm:ab-space-x-2",
      className,
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Title
    ref={ref}
    className={cn("ab-text-lg ab-font-semibold ab-text-foreground", className)}
    {...props}
  />
));
SheetTitle.displayName = SheetPrimitive.Title.displayName;

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(({ className, ...props }, ref) => (
  <SheetPrimitive.Description
    ref={ref}
    className={cn("ab-text-sm ab-text-muted-foreground", className)}
    {...props}
  />
));
SheetDescription.displayName = SheetPrimitive.Description.displayName;

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
