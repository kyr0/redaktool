'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateLeaf } from '@udecode/plate-common';

export const CodeLeaf = withRef<typeof PlateLeaf>(
  ({ children, className, ...props }, ref) => {
    return (
      <PlateLeaf
        asChild
        className={cn(
          'ab-whitespace-pre-wrap ab-rounded-md ab-bg-muted ab-px-[0.3em] ab-py-[0.2em] ab-font-mono ab-text-sm',
          className
        )}
        ref={ref}
        {...props}
      >
        <code>{children}</code>
      </PlateLeaf>
    );
  }
);
