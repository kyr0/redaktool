import React from 'react';

import type { TMentionElement } from '@udecode/plate-mention';

import { cn, withRef } from '@udecode/cn';
import { PlateElement, getHandler, useElement } from '@udecode/plate-common';
import { useFocused, useSelected } from 'slate-react';

export const MentionElement = withRef<
  typeof PlateElement,
  {
    onClick?: (mentionNode: any) => void;
    prefix?: string;
    renderLabel?: (mentionable: TMentionElement) => string;
  }
>(({ children, className, onClick, prefix, renderLabel, ...props }, ref) => {
  const element = useElement<TMentionElement>();
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement
      className={cn(
        'ab-inline-block ab-cursor-pointer ab-rounded-md ab-bg-muted ab-px-1.5 ab-py-0.5 ab-align-baseline ab-text-sm ab-font-medium',
        selected && focused && 'ab-ring-2 ab-ring-ring',
        element.children[0].bold === true && 'ab-font-bold',
        element.children[0].italic === true && 'ab-italic',
        element.children[0].underline === true && 'ab-underline',
        className
      )}
      contentEditable={false}
      data-slate-value={element.value}
      onClick={getHandler(onClick, element)}
      ref={ref}
      {...props}
    >
      {prefix}
      {renderLabel ? renderLabel(element) : element.value}
      {children}
    </PlateElement>
  );
});
