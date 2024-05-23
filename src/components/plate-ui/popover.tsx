'use client';

import * as React from 'react';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import { cva } from 'class-variance-authority';

export const Popover = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverAnchor = PopoverPrimitive.Anchor;

export const popoverVariants = cva(
  'ab-w-72 ab-rounded-md ab-border ab-bg-popover ab-p-4 ab-text-popover-foreground ab-shadow-md ab-outline-none data-[state=open]:ab-animate-in data-[state=closed]:ab-animate-out data-[state=closed]:ab-fade-out-0 data-[state=open]:ab-fade-in-0 data-[state=closed]:ab-zoom-out-95 data-[state=open]:ab-zoom-in-95 data-[side=bottom]:ab-slide-in-from-top-2 data-[side=left]:ab-slide-in-from-right-2 data-[side=right]:ab-slide-in-from-left-2 data-[side=top]:ab-slide-in-from-bottom-2 print:ab-hidden'
);

export const PopoverContent = withRef<typeof PopoverPrimitive.Content>(
  ({ align = 'center', className, sideOffset = 4, style, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        className={cn(popoverVariants(), className)}
        ref={ref}
        sideOffset={sideOffset}
        style={{ zIndex: 1000, ...style }}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
);
