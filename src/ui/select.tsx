import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown, ChevronUp } from "lucide-react"

import { cn } from "../lib/content-script/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "ab-flex ab-h-10 ab-w-full ab-items-center ab-justify-between ab-rounded-md ab-border ab-border-input ab-bg-background ab-px-3 ab-py-2 ab-text-sm ab-ring-offset-background placeholder:ab-text-muted-foreground focus:ab-outline-none focus:ab-ring-2 focus:ab-ring-ring focus:ab-ring-offset-2 disabled:ab-cursor-not-allowed disabled:ab-opacity-50 [&>span]:ab-line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="ab-h-4 ab-w-4 ab-opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "ab-flex ab-cursor-default ab-items-center ab-justify-center ab-py-1",
      className
    )}
    {...props}
  >
    <ChevronUp className="ab-h-4 ab-w-4" />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "ab-flex ab-cursor-default ab-items-center ab-justify-center ab-py-1",
      className
    )}
    {...props}
  >
    <ChevronDown className="ab-h-4 ab-w-4" />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "ab-relative ab-z-50 ab-max-h-96 ab-min-w-[8rem] ab-overflow-hidden ab-rounded-md ab-border ab-bg-popover ab-text-popover-foreground ab-shadow-md data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0 data-[state=closed]:ab-zoom-out-95 data-[state=open]:ab-zoom-in-95 data-[side=bottom]:ab-slide-in-from-top-2 data-[side=left]:ab-slide-in-from-right-2 data-[side=right]:ab-slide-in-from-left-2 data-[side=top]:ab-slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:ab-translate-y-1 data-[side=left]:-ab-translate-x-1 data-[side=right]:ab-translate-x-1 data-[side=top]:-ab-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "ab-p-1",
          position === "popper" &&
            "ab-h-[var(--radix-select-trigger-height)] ab-w-full ab-min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("ab-py-1.5 ab-pl-8 ab-pr-2 ab-text-sm ab-font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-w-full ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-py-1.5 ab-pl-8 ab-pr-2 ab-text-sm ab-outline-none focus:ab-bg-accent focus:ab-text-accent-foreground data-[disabled]:ab-pointer-events-none data-[disabled]:ab-opacity-50",
      className
    )}
    {...props}
  >
    <span className="ab-absolute ab-left-2 ab-flex ab-h-3.5 ab-w-3.5 ab-items-center ab-justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="ab-h-4 ab-w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-ab-mx-1 ab-my-1 ab-h-px ab-bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
