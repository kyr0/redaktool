'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  CommentResolveButton as CommentResolveButtonPrimitive,
  useComment,
} from '@udecode/plate-comments';

import { Icons } from '@/components/icons';

import { buttonVariants } from './button';

export function CommentResolveButton() {
  const comment = useComment()!;

  return (
    <CommentResolveButtonPrimitive
      className={cn(
        buttonVariants({ variant: 'ghost' }),
        'ab-h-6 ab-p-1 ab-text-muted-foreground'
      )}
    >
      {comment.isResolved ? (
        <Icons.refresh className='ab-size-4' />
      ) : (
        <Icons.check className='ab-size-4' />
      )}
    </CommentResolveButtonPrimitive>
  );
}
