import * as React from 'react';

import { Slot } from '@radix-ui/react-slot';
import { cn, withRef } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

export const buttonVariants = cva(
  'ab-inline-flex ab-items-center ab-justify-center ab-whitespace-nowrap ab-rounded-md ab-text-sm ab-font-medium ab-ring-offset-background ab-transition-colors focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-pointer-events-none disabled:ab-opacity-50',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      isMenu: {
        true: 'ab-h-auto ab-w-full ab-cursor-pointer ab-justify-start',
      },
      size: {
        default: 'ab-h-10 ab-px-4 ab-py-2',
        icon: 'ab-size-10',
        lg: 'ab-h-11 ab-rounded-md ab-px-8',
        none: 'ab-',
        sm: 'ab-h-9 ab-rounded-md ab-px-3',
        sms: 'ab-size-9 ab-rounded-md ab-px-0',
        xs: 'ab-h-8 ab-rounded-md ab-px-3',
      },
      variant: {
        default: 'ab-bg-primary ab-text-primary-foreground hover:ab-bg-primary/90',
        destructive:
          'ab-bg-destructive ab-text-destructive-foreground hover:ab-bg-destructive/90',
        ghost: 'hover:ab-bg-accent hover:ab-text-accent-foreground',
        inlineLink: 'ab-text-base ab-text-primary ab-underline ab-underline-offset-4',
        link: 'ab-text-primary ab-underline-offset-4 hover:ab-underline',
        outline:
          'ab-border ab-border-input ab-bg-background hover:ab-bg-accent hover:ab-text-accent-foreground',
        secondary:
          'ab-bg-secondary ab-text-secondary-foreground hover:ab-bg-secondary/80',
      },
    },
  }
);

export const Button = withRef<
  'button',
  {
    asChild?: boolean;
  } & VariantProps<typeof buttonVariants>
>(({ asChild = false, className, isMenu, size, variant, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';

  return (
    <Comp
      className={cn(buttonVariants({ className, isMenu, size, variant }))}
      ref={ref}
      {...props}
    />
  );
});
