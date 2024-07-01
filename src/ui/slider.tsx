import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "../lib/content-script/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-w-full ab-touch-none ab-select-none ab-items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="ab-relative ab-h-2 ab-w-full ab-grow ab-overflow-hidden ab-rounded-full ab-bg-secondary">
      <SliderPrimitive.Range className="ab-absolute ab-h-full ab-ftr-bg-halfcontrast" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="ab-block ab-h-5 ab-w-5 ab-rounded-full ab-border-2 ab-border-accent ab-ftr-bg-halfcontrast ab-ring-offset-background ab-transition-colors focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-pointer-events-none disabled:ab-opacity-50" />
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
