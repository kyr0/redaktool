import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../lib/content-script/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "ab-ml-2 ab-mt-2 -ab-mb-1 ab-mr-2 ab-inline-flex ab-rounded-md ab-p-1 ab-text-muted-foreground -ab-pt-1 ab-h-12 !ab-justify-start !ab-min-h-12 ab-items-stretch ab-bg-transparent",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "ab-inline-flex ab-cursor-pointer ab-items-center ab-justify-center ab-whitespace-nowrap ab-rounded-sm ab-px-3 ab-py-1.5 ab-text-sm ab-font-medium ab-ring-offset-background ab-transition-all focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-pointer-events-none disabled:ab-opacity-50 data-[state=active]:ab-bg-background data-[state=active]:ab-text-foreground data-[state=active]:ab-shadow-sm ab-max-h-6 ab-text-md",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "ab-ring-offset-background focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
