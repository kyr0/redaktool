import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

export const HrElement = withRef<typeof PlateElement>(
  ({ className, nodeProps, ...props }, ref) => {
    const { children } = props;

    const selected = useSelected();
    const focused = useFocused();

    return (
      <PlateElement ref={ref} {...props}>
        <div className='ab-py-6' contentEditable={false}>
          <hr
            {...nodeProps}
            className={cn(
              'ab-h-0.5 ab-cursor-pointer ab-rounded-sm ab-border-none ab-bg-muted ab-bg-clip-content',
              selected && focused && 'ab-ring-2 ab-ring-ring ab-ring-offset-2',
              className
            )}
          />
        </div>
        {children}
      </PlateElement>
    );
  }
);
