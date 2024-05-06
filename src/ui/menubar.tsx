import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";
import { Check, ChevronRight, Circle } from "lucide-react";

import { cn } from "../lib/content-script/utils";

const MenubarMenu = MenubarPrimitive.Menu;

const MenubarGroup = MenubarPrimitive.Group;

const MenubarPortal = MenubarPrimitive.Portal;

const MenubarSub = MenubarPrimitive.Sub;

const MenubarRadioGroup = MenubarPrimitive.RadioGroup;

const Menubar = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Root>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Root
    ref={ref}
    className={cn(
      "ab-flex ab-h-10 ab-items-center ab-space-x-1 ab-rounded-md ab-border ab-bg-background ab-p-1",
      className,
    )}
    {...props}
  />
));
Menubar.displayName = MenubarPrimitive.Root.displayName;

const MenubarTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Trigger
    ref={ref}
    className={cn(
      "ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-px-3 ab-py-1.5 ab-text-sm ab-font-medium ab-outline-none focus:ab-bg-accent focus:ab-text-accent-foreground data-[state=open]:ab-bg-accent data-[state=open]:ab-text-accent-foreground",
      className,
    )}
    {...props}
  />
));
MenubarTrigger.displayName = MenubarPrimitive.Trigger.displayName;

const MenubarSubTrigger = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(({ className, inset, children, ...props }, ref) => (
  <MenubarPrimitive.SubTrigger
    ref={ref}
    className={cn(
      "ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-px-2 ab-py-1.5 ab-text-sm ab-outline-none focus:ab-bg-accent focus:ab-text-accent-foreground data-[state=open]:ab-bg-accent data-[state=open]:ab-text-accent-foreground",
      inset && "ab-pl-8",
      className,
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ab-ml-auto ab-h-4 ab-w-4" />
  </MenubarPrimitive.SubTrigger>
));
MenubarSubTrigger.displayName = MenubarPrimitive.SubTrigger.displayName;

const MenubarSubContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.SubContent>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.SubContent
    ref={ref}
    className={cn(
      "ab-z-50 ab-min-w-[8rem] ab-overflow-hidden ab-rounded-md ab-border ab-bg-popover ab-p-1 ab-text-popover-foreground data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0 data-[state=closed]:ab-zoom-out-95 data-[state=open]:ab-zoom-in-95 data-[side=bottom]:ab-slide-in-from-top-2 data-[side=left]:ab-slide-in-from-right-2 data-[side=right]:ab-slide-in-from-left-2 data-[side=top]:ab-slide-in-from-bottom-2",
      className,
    )}
    {...props}
  />
));
MenubarSubContent.displayName = MenubarPrimitive.SubContent.displayName;

const MenubarContent = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Content>
>(
  (
    { className, align = "start", alignOffset = -4, sideOffset = 8, ...props },
    ref,
  ) => (
    <MenubarPrimitive.Portal>
      <MenubarPrimitive.Content
        ref={ref}
        align={align}
        alignOffset={alignOffset}
        sideOffset={sideOffset}
        className={cn(
          "ab-z-50 ab-min-w-[12rem] ab-overflow-hidden ab-rounded-md ab-border ab-bg-popover ab-p-1 ab-text-popover-foreground ab-shadow-md data-[state=open]:ab-animate-in data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0 data-[state=closed]:ab-zoom-out-95 data-[state=open]:ab-zoom-in-95 data-[side=bottom]:ab-slide-in-from-top-2 data-[side=left]:ab-slide-in-from-right-2 data-[side=right]:ab-slide-in-from-left-2 data-[side=top]:ab-slide-in-from-bottom-2",
          className,
        )}
        {...props}
      />
    </MenubarPrimitive.Portal>
  ),
);
MenubarContent.displayName = MenubarPrimitive.Content.displayName;

const MenubarItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Item> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Item
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-px-2 ab-py-1.5 ab-text-sm ab-outline-none focus:ab-bg-accent focus:ab-text-accent-foreground data-[disabled]:ab-pointer-events-none data-[disabled]:ab-opacity-50",
      inset && "ab-pl-8",
      className,
    )}
    {...props}
  />
));
MenubarItem.displayName = MenubarPrimitive.Item.displayName;

const MenubarCheckboxItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.CheckboxItem>
>(({ className, children, checked, ...props }, ref) => (
  <MenubarPrimitive.CheckboxItem
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-py-1.5 ab-pl-8 ab-pr-2 ab-text-sm ab-outline-none focus:ab-bg-accent focus:ab-text-accent-foreground data-[disabled]:ab-pointer-events-none data-[disabled]:ab-opacity-50",
      className,
    )}
    checked={checked}
    {...props}
  >
    <span className="ab-absolute ab-left-2 ab-flex ab-h-3.5 ab-w-3.5 ab-items-center ab-justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Check className="ab-h-4 ab-w-4" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.CheckboxItem>
));
MenubarCheckboxItem.displayName = MenubarPrimitive.CheckboxItem.displayName;

const MenubarRadioItem = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.RadioItem>
>(({ className, children, ...props }, ref) => (
  <MenubarPrimitive.RadioItem
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-cursor-default ab-select-none ab-items-center ab-rounded-sm ab-py-1.5 ab-pl-8 ab-pr-2 ab-text-sm ab-outline-none focus:ab-bg-accent focus:ab-text-accent-foreground data-[disabled]:ab-pointer-events-none data-[disabled]:ab-opacity-50",
      className,
    )}
    {...props}
  >
    <span className="ab-absolute ab-left-2 ab-flex ab-h-3.5 ab-w-3.5 ab-items-center ab-justify-center">
      <MenubarPrimitive.ItemIndicator>
        <Circle className="ab-h-2 ab-w-2 ab-fill-current" />
      </MenubarPrimitive.ItemIndicator>
    </span>
    {children}
  </MenubarPrimitive.RadioItem>
));
MenubarRadioItem.displayName = MenubarPrimitive.RadioItem.displayName;

const MenubarLabel = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Label> & {
    inset?: boolean;
  }
>(({ className, inset, ...props }, ref) => (
  <MenubarPrimitive.Label
    ref={ref}
    className={cn(
      "ab-px-2 ab-py-1.5 ab-text-sm ab-font-semibold",
      inset && "ab-pl-8",
      className,
    )}
    {...props}
  />
));
MenubarLabel.displayName = MenubarPrimitive.Label.displayName;

const MenubarSeparator = React.forwardRef<
  React.ElementRef<typeof MenubarPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof MenubarPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <MenubarPrimitive.Separator
    ref={ref}
    className={cn("-ab-mx-1 ab-my-1 ab-h-px ab-bg-muted", className)}
    {...props}
  />
));
MenubarSeparator.displayName = MenubarPrimitive.Separator.displayName;

const MenubarShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ab-ml-auto ab-text-xs ab-tracking-widest ab-text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
};
MenubarShortcut.displayname = "MenubarShortcut";

export {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarLabel,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarPortal,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarGroup,
  MenubarSub,
  MenubarShortcut,
};
