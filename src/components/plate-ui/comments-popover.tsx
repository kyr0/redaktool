'use client';

import React from 'react';

import { cn } from '@udecode/cn';
import {
  CommentProvider,
  CommentsPositioner,
  SCOPE_ACTIVE_COMMENT,
  useFloatingCommentsContentState,
  useFloatingCommentsState,
} from '@udecode/plate-comments';
import { PortalBody } from '@udecode/plate-common';

import { CommentCreateForm } from './comment-create-form';
import { CommentItem } from './comment-item';
import { CommentReplyItems } from './comment-reply-items';
import { popoverVariants } from './popover';

export type FloatingCommentsContentProps = {
  disableForm?: boolean;
};

export function CommentsPopoverContent(props: FloatingCommentsContentProps) {
  const { disableForm } = props;

  const { activeCommentId, hasNoComment, myUserId, ref } =
    useFloatingCommentsContentState();

  return (
    <CommentProvider
      id={activeCommentId}
      key={activeCommentId}
      scope={SCOPE_ACTIVE_COMMENT}
    >
      <div className={cn(popoverVariants(), 'ab-relative ab-w-[310px]')} ref={ref}>
        {!hasNoComment && (
          <>
            <CommentItem commentId={activeCommentId} key={activeCommentId} />

            <CommentReplyItems />
          </>
        )}

        {!!myUserId && !disableForm && <CommentCreateForm />}
      </div>
    </CommentProvider>
  );
}

export function CommentsPopover() {
  const { activeCommentId, loaded } = useFloatingCommentsState();

  if (!loaded || !activeCommentId) return null;

  return (
    <PortalBody>
      <CommentsPositioner className='ab-absolute ab-z-50 ab-w-[418px] ab-pb-4'>
        <CommentsPopoverContent />
      </CommentsPositioner>
    </PortalBody>
  );
}
