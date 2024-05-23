'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PortalBody, useComposedRef } from '@udecode/plate-common';
import {
  type FloatingToolbarState,
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from '@udecode/plate-floating';

import { Toolbar } from './toolbar';

export const FloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState;
  }
>(({ children, state, ...props }, componentRef) => {
  const floatingToolbarState = useFloatingToolbarState({
    ...state,
    floatingOptions: {
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: [
            'top-start',
            'top-end',
            'bottom-start',
            'bottom-end',
          ],
          padding: 12,
        }),
      ],
      placement: 'top',
      ...state?.floatingOptions,
    },
  });

  const {
    hidden,
    props: rootProps,
    ref: floatingRef,
  } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(componentRef, floatingRef);

  if (hidden) return null;

  return (
    <PortalBody>
      <Toolbar
        className={cn(
          'ab-absolute ab-z-50 ab-whitespace-nowrap ab-border ab-bg-popover ab-px-1 ab-opacity-100 ab-shadow-md print:ab-hidden'
        )}
        ref={ref}
        {...rootProps}
        {...props}
      >
        {children}
      </Toolbar>
    </PortalBody>
  );
});
