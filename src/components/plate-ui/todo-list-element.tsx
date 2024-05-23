import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';
import {
  useTodoListElement,
  useTodoListElementState,
} from '@udecode/plate-list';

import { Checkbox } from './checkbox';

export const TodoListElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { element } = props;
    const state = useTodoListElementState({ element });
    const { checkboxProps } = useTodoListElement(state);

    return (
      <PlateElement
        className={cn('ab-flex ab-flex-row ab-py-1', className)}
        ref={ref}
        {...props}
      >
        <div
          className='ab-mr-1.5 ab-flex ab-select-none ab-items-center ab-justify-center'
          contentEditable={false}
        >
          <Checkbox {...checkboxProps} />
        </div>
        <span
          className={cn(
            'ab-flex-1 focus:ab-outline-none',
            state.checked && 'ab-text-muted-foreground ab-line-through'
          )}
          contentEditable={!state.readOnly}
          suppressContentEditableWarning
        >
          {children}
        </span>
      </PlateElement>
    );
  }
);
