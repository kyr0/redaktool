import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "../lib/content-script/utils"

const ToastProvider = ToastPrimitives.Provider

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "ab-fixed ab-top-0 ab-z-[100] ab-flex ab-max-h-screen ab-w-full ab-flex-col-reverse ab-p-4 sm:ab-bottom-0 sm:ab-right-0 sm:ab-top-auto sm:ab-flex-col md:ab-max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

const toastVariants = cva(
  "ab-group ab-pointer-events-auto ab-relative ab-flex ab-w-full ab-items-center ab-justify-between ab-space-x-4 ab-overflow-hidden ab-rounded-md ab-border ab-p-2 ab-pr-8 ab-shadow-lg ab-transition-all data-[swipe=cancel]:ab-translate-x-0 data-[swipe=end]:ab-translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:ab-translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:ab-transition-none data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[swipe=end]:ab-animate-out data-[state=closed]:ab-fade-out-80 data-[state=closed]:ab-slide-out-to-right-full data-[state=open]:ab-slide-in-from-top-full data-[state=open]:ab-sm",
  {
    variants: {
      variant: {
        default: "ab-border ab-bg-background ab-text-foreground",
        destructive:
          "ab-destructive ab-group ab-border-destructive ab-bg-destructive ab-text-destructive-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> &
    VariantProps<typeof toastVariants>
>(({ className, variant, ...props }, ref) => {
  return (
    <ToastPrimitives.Root
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "ab-inline-flex ab-h-8 ab-shrink-0 ab-items-center ab-justify-center ab-rounded-md ab-border ab-bg-transparent ab-px-3 ab-text-sm ab-font-medium ab-ring-offset-background ab-transition-colors hover:ab-bg-secondary focus:ab-outline-none focus:ab-ring-2 focus:ab-ring-ring focus:ab-ring-offset-2 disabled:ab-pointer-events-none disabled:ab-opacity-50 group-[.destructive]:ab-border-muted/40 group-[.destructive]:ab-hover group-[.destructive]:ab-hover group-[.destructive]:ab-hover group-[.destructive]:ab-focus",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "ab-absolute ab-right-2 ab-top-2 ab-rounded-md ab-p-1 ab-text-foreground/50 ab-opacity-0 ab-transition-opacity hover:ab-text-foreground focus:ab-opacity-100 focus:ab-outline-none focus:ab-ring-2 group-hover:ab-opacity-100 group-[.destructive]:ab-text-red-300 group-[.destructive]:ab-hover group-[.destructive]:ab-focus group-[.destructive]:ab-focus",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="ab-h-4 ab-w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("ab-text-sm ab-font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("ab-text-sm ab-opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>

type ToastActionElement = React.ReactElement<typeof ToastAction>

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}
