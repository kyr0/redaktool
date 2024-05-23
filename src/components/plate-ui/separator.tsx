'use client';

import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { withProps, withVariants } from '@udecode/cn';
import { cva } from 'class-variance-authority';

const separatorVariants = cva('ab-shrink-0 ab-bg-border', {
  defaultVariants: {
    orientation: 'horizontal',
  },
  variants: {
    orientation: {
      horizontal: 'ab-h-px ab-w-full',
      vertical: 'ab-h-full ab-w-px',
    },
  },
});

export const Separator = withVariants(
  withProps(SeparatorPrimitive.Root, {
    decorative: true,
    orientation: 'horizontal',
  }),
  separatorVariants
);
