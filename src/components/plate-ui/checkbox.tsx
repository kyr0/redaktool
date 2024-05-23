'use client';

import * as React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { cn, withRef } from '@udecode/cn';

import { Icons } from '@/components/icons';

export const Checkbox = withRef<typeof CheckboxPrimitive.Root>(
  ({ className, ...props }, ref) => (
    <CheckboxPrimitive.Root
      className={cn(
        'ab-peer ab-size-4 ab-shrink-0 ab-rounded-sm ab-border ab-border-primary ab-bg-background ab-ring-offset-background focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-cursor-not-allowed disabled:ab-opacity-50 data-[state=checked]:ab-bg-primary data-[state=checked]:ab-text-primary-foreground',
        className
      )}
      ref={ref}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn('ab-flex ab-items-center ab-justify-center ab-text-current')}
      >
        <Icons.check className='ab-size-4' />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
);
