import * as React from "react";
import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu";
import { cva } from "class-variance-authority";
import { ChevronDown } from "lucide-react";

import { cn } from "../lib/content-script/utils";

const NavigationMenu = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Root
    ref={ref}
    className={cn(
      "ab-relative ab-z-10 ab-flex ab-max-w-max ab-flex-1 ab-items-center ab-justify-center",
      className,
    )}
    {...props}
  >
    {children}
    <NavigationMenuViewport />
  </NavigationMenuPrimitive.Root>
));
NavigationMenu.displayName = NavigationMenuPrimitive.Root.displayName;

const NavigationMenuList = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.List>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.List
    ref={ref}
    className={cn(
      "ab-group ab-flex ab-flex-1 ab-list-none ab-items-center ab-justify-center ab-space-x-1",
      className,
    )}
    {...props}
  />
));
NavigationMenuList.displayName = NavigationMenuPrimitive.List.displayName;

const NavigationMenuItem = NavigationMenuPrimitive.Item;

const navigationMenuTriggerStyle = cva(
  "ab-group ab-inline-flex ab-h-10 ab-w-max ab-items-center ab-justify-center ab-rounded-md ab-bg-background ab-px-4 ab-py-2 ab-text-sm ab-font-medium ab-transition-colors hover:ab-bg-accent hover:ab-text-accent-foreground focus:ab-bg-accent focus:ab-text-accent-foreground focus:ab-outline-none disabled:ab-pointer-events-none disabled:ab-opacity-50 data-[active]:ab-bg-accent/50 data-[state=open]:ab-bg-accent/50",
);

const NavigationMenuTrigger = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <NavigationMenuPrimitive.Trigger
    ref={ref}
    className={cn(navigationMenuTriggerStyle(), "group", className)}
    {...props}
  >
    {children}{" "}
    <ChevronDown
      className="ab-relative ab-top-[1px] ab-ml-1 ab-h-3 ab-w-3 ab-transition ab-duration-200 group-data-[state=open]:ab-rotate-180"
      aria-hidden="true"
    />
  </NavigationMenuPrimitive.Trigger>
));
NavigationMenuTrigger.displayName = NavigationMenuPrimitive.Trigger.displayName;

const NavigationMenuContent = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Content>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Content
    ref={ref}
    className={cn(
      "ab-left-0 ab-top-0 ab-w-full data-[motion^=from-]:ab-animate-in data-[motion^=to-]:ab-animate-out data-[motion^=from-]:ab-fade-in data-[motion^=to-]:ab-fade-out data-[motion=from-end]:ab-slide-in-from-right-52 data-[motion=from-start]:ab-slide-in-from-left-52 data-[motion=to-end]:ab-slide-out-to-right-52 data-[motion=to-start]:ab-slide-out-to-left-52 md:ab-absolute md:ab-w-auto",
      className,
    )}
    {...props}
  />
));
NavigationMenuContent.displayName = NavigationMenuPrimitive.Content.displayName;

const NavigationMenuLink = NavigationMenuPrimitive.Link;

const NavigationMenuViewport = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <div
    className={cn(
      "ab-absolute ab-left-0 ab-top-full ab-flex ab-justify-center",
    )}
  >
    <NavigationMenuPrimitive.Viewport
      className={cn(
        "ab-origin-top-center ab-relative ab-mt-1.5 ab-h-[var(--radix-navigation-menu-viewport-height)] ab-w-full ab-overflow-hidden ab-rounded-md ab-border ab-bg-popover ab-text-popover-foreground ab-shadow-lg data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-zoom-out-95 data-[state=open]:ab-zoom-in-90 md:ab-w-[var(--radix-navigation-menu-viewport-width)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  </div>
));
NavigationMenuViewport.displayName =
  NavigationMenuPrimitive.Viewport.displayName;

const NavigationMenuIndicator = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitive.Indicator>,
  React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitive.Indicator>
>(({ className, ...props }, ref) => (
  <NavigationMenuPrimitive.Indicator
    ref={ref}
    className={cn(
      "ab-top-full ab-z-[1] ab-flex ab-h-1.5 ab-items-end ab-justify-center ab-overflow-hidden data-[state=visible]:ab-animate-in data-[state=hidden]:ab-animate-out data-[state=hidden]:ab-fade-out data-[state=visible]:ab-fade-in",
      className,
    )}
    {...props}
  >
    <div className="ab-relative ab-top-[60%] ab-h-2 ab-w-2 ab-rotate-45 ab-rounded-tl-sm ab-bg-border ab-shadow-md" />
  </NavigationMenuPrimitive.Indicator>
));
NavigationMenuIndicator.displayName =
  NavigationMenuPrimitive.Indicator.displayName;

export {
  navigationMenuTriggerStyle,
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuContent,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
  NavigationMenuViewport,
};
