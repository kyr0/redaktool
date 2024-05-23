import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';

export const TableRowElement = withRef<
  typeof PlateElement,
  {
    hideBorder?: boolean;
  }
>(({ children, hideBorder, ...props }, ref) => {
  return (
    <PlateElement
      asChild
      className={cn('ab-h-full', hideBorder && 'ab-border-none')}
      ref={ref}
      {...props}
    >
      <tr>{children}</tr>
    </PlateElement>
  );
});
