import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement, getHandler } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

export const MentionInputElement = withRef<
  typeof PlateElement,
  {
    onClick?: (mentionNode: any) => void;
  }
>(({ className, onClick, ...props }, ref) => {
  const { children, element } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      asChild
      className={cn(
        'ab-inline-block ab-rounded-md ab-bg-muted ab-px-1.5 ab-py-0.5 ab-align-baseline ab-text-sm',
        selected && focused && 'ab-ring-2 ab-ring-ring',
        className
      )}
      data-slate-value={element.value}
      onClick={getHandler(onClick, element)}
      ref={ref}
      {...props}
    >
      <span>{children}</span>
    </PlateElement>
  );
});
