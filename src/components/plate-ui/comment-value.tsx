'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  CommentEditActions,
  CommentEditTextarea,
} from '@udecode/plate-comments';

import { buttonVariants } from './button';
import { inputVariants } from './input';

export function CommentValue() {
  return (
    <div className='ab-my-2 ab-flex ab-flex-col ab-items-end ab-gap-2'>
      <CommentEditTextarea className={cn(inputVariants(), 'ab-min-h-[60px]')} />

      <div className='ab-flex ab-space-x-2'>
        <CommentEditActions.CancelButton
          className={buttonVariants({ size: 'xs', variant: 'outline' })}
        >
          Cancel
        </CommentEditActions.CancelButton>

        <CommentEditActions.SaveButton
          className={buttonVariants({ size: 'xs', variant: 'default' })}
        >
          Save
        </CommentEditActions.SaveButton>
      </div>
    </div>
  );
}
