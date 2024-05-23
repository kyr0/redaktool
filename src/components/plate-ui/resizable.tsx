'use client';

import React from 'react';

import { cn, withRef, withVariants } from '@udecode/cn';
import {
  Resizable as ResizablePrimitive,
  ResizeHandle as ResizeHandlePrimitive,
} from '@udecode/plate-resizable';
import { cva } from 'class-variance-authority';

export const mediaResizeHandleVariants = cva(
  cn(
    'top-0 flex w-6 select-none flex-col justify-center',
    "after:flex after:h-16 after:w-[3px] after:rounded-[6px] after:bg-ring after:opacity-0 after:content-['_'] group-hover:after:opacity-100"
  ),
  {
    variants: {
      direction: {
        left: 'ab--left-3 ab--ml-3 ab-pl-3',
        right: 'ab--right-3 ab--mr-3 ab-items-end ab-pr-3',
      },
    },
  }
);

const resizeHandleVariants = cva(cn('absolute z-40'), {
  variants: {
    direction: {
      bottom: 'ab-w-full ab-cursor-row-resize',
      left: 'ab-h-full ab-cursor-col-resize',
      right: 'ab-h-full ab-cursor-col-resize',
      top: 'ab-w-full ab-cursor-row-resize',
    },
  },
});

const ResizeHandleVariants = withVariants(
  ResizeHandlePrimitive,
  resizeHandleVariants,
  ['direction']
);

export const ResizeHandle = withRef<typeof ResizeHandlePrimitive>(
  (props, ref) => (
    <ResizeHandleVariants
      direction={props.options?.direction}
      ref={ref}
      {...props}
    />
  )
);

const resizableVariants = cva('ab-', {
  variants: {
    align: {
      center: 'ab-mx-auto',
      left: 'ab-mr-auto',
      right: 'ab-ml-auto',
    },
  },
});

export const Resizable = withVariants(ResizablePrimitive, resizableVariants, [
  'align',
]);
