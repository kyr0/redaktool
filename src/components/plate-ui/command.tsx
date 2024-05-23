'use client';

import * as React from 'react';

import type { DialogProps } from '@radix-ui/react-dialog';

import { cn, createPrimitiveElement, withCn, withRef } from '@udecode/cn';
import { Command as CommandPrimitive } from 'cmdk';

import { Icons } from '@/components/icons';

import { Dialog, DialogContent } from './dialog';

export const Command = withCn(
  CommandPrimitive,
  'flex size-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground'
);

export function CommandDialog({ children, ...props }: DialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className='ab-overflow-hidden ab-p-0 ab-shadow-lg'>
        <Command className='[&_[cmdk-group-heading]]:ab-px-2 [&_[cmdk-group-heading]]:ab-font-medium [&_[cmdk-group-heading]]:ab-text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:ab-pt-0 [&_[cmdk-group]]:ab-px-2 [&_[cmdk-input-wrapper]_svg]:ab-size-5 [&_[cmdk-input]]:ab-h-12 [&_[cmdk-item]]:ab-px-2 [&_[cmdk-item]]:ab-py-3 [&_[cmdk-item]_svg]:ab-size-5'>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

export const CommandInput = withRef<typeof CommandPrimitive.Input>(
  ({ className, ...props }, ref) => (
    <div className='ab-flex ab-items-center ab-border-b ab-px-3' cmdk-input-wrapper="">
      <Icons.search className='ab-mr-2 ab-size-4 ab-shrink-0 ab-opacity-50' />
      <CommandPrimitive.Input
        className={cn(
          'ab-flex ab-h-11 ab-w-full ab-rounded-md ab-bg-transparent ab-py-3 ab-text-sm ab-outline-none placeholder:ab-text-muted-foreground disabled:ab-cursor-not-allowed disabled:ab-opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
    </div>
  )
);

export const CommandList = withCn(
  CommandPrimitive.List,
  'max-h-[500px] overflow-y-auto overflow-x-hidden'
);

export const CommandEmpty = withCn(
  CommandPrimitive.Empty,
  'py-6 text-center text-sm'
);

export const CommandGroup = withCn(
  CommandPrimitive.Group,
  'overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground'
);

export const CommandSeparator = withCn(
  CommandPrimitive.Separator,
  '-mx-1 h-px bg-border'
);

export const CommandItem = withCn(
  CommandPrimitive.Item,
  'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
);

export const CommandShortcut = withCn(
  createPrimitiveElement('span'),
  'ml-auto text-xs tracking-widest text-muted-foreground'
);
