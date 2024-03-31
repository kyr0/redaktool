import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "../lib/content-script/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("ab-grid ab-gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "ab-aspect-square ab-h-4 ab-w-4 ab-rounded-full ab-border ab-border-primary ab-text-primary ab-ring-offset-background focus:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-cursor-not-allowed disabled:ab-opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="ab-flex ab-items-center ab-justify-center">
        <Circle className="ab-h-2.5 ab-w-2.5 ab-fill-current ab-text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
