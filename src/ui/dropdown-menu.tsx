import * as React from "react"
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "../lib/content-script/utils"

const DropdownMenu = DropdownMenuPrimitive.Root

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger

const DropdownMenuGroup = DropdownMenuPrimitive.Group

const DropdownMenuPortal = DropdownMenuPrimitive.Portal

const DropdownMenuSub = DropdownMenuPrimitive.Sub

const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <DropdownMenuPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-px-2 ab-py-1.5 ab-text-sm ab-outline-none focus:ab-bg-accent data-[state=open]:ab-bg-accent",
      inset && "ab-pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ab-ml-auto ab-h-4 ab-w-4" />
  </DropdownMenuPrimitive.SubTrigger>
))
DropdownMenuSubTrigger.displayName =
  DropdownMenuPrimitive.SubTrigger.displayName

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.SubContent
    ref={ref}
    className={cn(
      "ab-z-50 ab-min-w-[8rem] ab-overflow-hidden ab-rounded-md ab-border ab-bg-popover ab-p-1 ab-text-popover-foreground ab-shadow-lg data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0 data-[state=closed]:ab-zoom-out-95 data-[state=open]:ab-zoom-in-95 data-[side=bottom]:ab-slide-in-from-top-2 data-[side=left]:ab-slide-in-from-right-2 data-[side=right]:ab-slide-in-from-left-2 data-[side=top]:ab-slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName =
  DropdownMenuPrimitive.SubContent.displayName

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "ab-z-50 ab-min-w-[8rem] ab-overflow-hidden ab-rounded-md ab-border ab-bg-popover ab-p-1 ab-text-popover-foreground ab-shadow-md data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0 data-[state=closed]:ab-zoom-out-95 data-[state=open]:ab-zoom-in-95 data-[side=bottom]:ab-slide-in-from-top-2 data-[side=left]:ab-slide-in-from-right-2 data-[side=right]:ab-slide-in-from-left-2 data-[side=top]:ab-slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
))
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-px-2 ab-py-1.5 ab-text-sm ab-outline-none ab-transition-colors focus:ab-bg-accent focus:ab-text-accent-foreground data-[disabled]:ab-pointer-events-none data-[disabled]:ab-opacity-50",
      inset && "ab-pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <DropdownMenuPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-py-1.5 ab-pl-8 ab-pr-2 ab-text-sm ab-outline-none ab-transition-colors focus:ab-bg-accent focus:ab-text-accent-foreground data-[disabled]:ab-pointer-events-none data-[disabled]:ab-opacity-50",
      className
    )}
    checked={checked}
    {...props}
  >
    <span className="ab-absolute ab-left-2 ab-flex ab-h-3.5 ab-w-3.5 ab-items-center ab-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Check className="ab-h-4 ab-w-4" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>
))
DropdownMenuCheckboxItem.displayName =
  DropdownMenuPrimitive.CheckboxItem.displayName

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <DropdownMenuPrimitive.RadioItem
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-py-1.5 ab-pl-8 ab-pr-2 ab-text-sm ab-outline-none ab-transition-colors focus:ab-bg-accent focus:ab-text-accent-foreground data-[disabled]:ab-pointer-events-none data-[disabled]:ab-opacity-50",
      className
    )}
    {...props}
  >
    <span className="ab-absolute ab-left-2 ab-flex ab-h-3.5 ab-w-3.5 ab-items-center ab-justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <Circle className="ab-h-2 ab-w-2 ab-fill-current" />
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>
))
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn(
      "ab-px-2 ab-py-1.5 ab-text-sm ab-font-semibold",
      inset && "ab-pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("-ab-mx-1 ab-my-1 ab-h-px ab-bg-muted", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ab-ml-auto ab-text-xs ab-tracking-widest ab-opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}
