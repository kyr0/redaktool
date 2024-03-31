import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "../lib/content-script/utils"

const Dialog = DialogPrimitive.Root

const DialogTrigger = DialogPrimitive.Trigger

const DialogPortal = DialogPrimitive.Portal

const DialogClose = DialogPrimitive.Close

export const HeaderButtonStyle = "ab-rounded-sm ab-opacity-70 ab-ring-offset-background ab-transition-opacity hover:ab-opacity-100 focus:ab-outline-none focus:ab-ring-2 focus:ab-ring-ring focus:ab-ring-offset-2 disabled:ab-pointer-events-none data-[state=open]:ab-bg-accent data-[state=open]:ab-text-muted-foreground ab-ml-1 ab-h-6 ab-w-6 ab-flex ab-items-center ab-justify-center"

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "ab-fixed ab-inset-0 ab-z-50 ab-bg-background/80 ab-backdrop-blur-sm data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & { showOverlay?: boolean, wrapperClassName?: string}
>(({ className, wrapperClassName= "", showOverlay = true, children, ...props }, ref) => {
  return (
    <div ref={ref} className={wrapperClassName}>
      {showOverlay && <DialogOverlay />}
        <DialogPrimitive.Content
          className={cn(
            "ab-ftr-bg ab-grid ab-w-full ab-gap-2 ab-border ab-bg-background ab-p-2 ab-shadow-lg ab-duration-200 data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0 data-[state=closed]:ab-zoom-out-95 data-[state=open]:ab-zoom-in-95 data-[state=closed]:ab-slide-out-to-left-1/2 data-[state=closed]:ab-slide-out-to-top-[48%] data-[state=open]:ab-slide-in-from-left-1/2 data-[state=open]:ab-slide-in-from-top-[48%] sm:ab-rounded-lg",
            className
          )}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
    </div>
  )}
)
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "ab-ftr-bg ab-flex ab-flex-col ab-space-y-1.5 ab-text-center sm:ab-text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "ab-ftr-bg ab-flex ab-flex-col-reverse sm:ab-flex-row sm:ab-justify-end sm:ab-space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "ab-font-semibold ab-leading-none ab-tracking-tight !ab-m-0",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("ab-text-sm ab-text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
