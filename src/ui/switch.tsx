import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "../lib/content-script/utils";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "ab-peer ab-inline-flex ab-h-6 ab-w-11 ab-shrink-0 ab-cursor-pointer ab-items-center ab-rounded-full ab-border-2 ab-border-transparent ab-transition-colors focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 focus-visible:ab-ring-offset-background disabled:ab-cursor-not-allowed disabled:ab-opacity-50 data-[state=checked]:ab-bg-primary data-[state=unchecked]:ab-bg-input",
      className,
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "ab-pointer-events-none ab-block ab-h-5 ab-w-5 ab-rounded-full ab-bg-background ab-shadow-lg ab-ring-0 ab-transition-transform data-[state=checked]:ab-translate-x-5 data-[state=unchecked]:ab-translate-x-0",
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
