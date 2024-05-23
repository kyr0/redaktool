'use client';

import React from 'react';

import {
  CommentProvider,
  useCommentById,
  useCommentItemContentState,
} from '@udecode/plate-comments';
import { formatDistance } from 'date-fns';

import { CommentAvatar } from './comment-avatar';
import { CommentMoreDropdown } from './comment-more-dropdown';
import { CommentResolveButton } from './comment-resolve-button';
import { CommentValue } from './comment-value';

type PlateCommentProps = {
  commentId: string;
};

function CommentItemContent() {
  const {
    comment,
    commentText,
    editingValue,
    isMyComment,
    isReplyComment,
    user,
  } = useCommentItemContentState();

  return (
    <div>
      <div className='ab-relative ab-flex ab-items-center ab-gap-2'>
        <CommentAvatar userId={comment.userId} />

        <h4 className='ab-text-sm ab-font-semibold ab-leading-none'>{user?.name}</h4>

        <div className='ab-text-xs ab-leading-none ab-text-muted-foreground'>
          {formatDistance(comment.createdAt, Date.now())} ago
        </div>

        {isMyComment && (
          <div className='ab-absolute ab--right-0.5 ab--top-0.5 ab-flex ab-space-x-1'>
            {isReplyComment ? null : <CommentResolveButton />}

            <CommentMoreDropdown />
          </div>
        )}
      </div>

      <div className='ab-mb-4 ab-pl-7 ab-pt-0.5'>
        {editingValue ? (
          <CommentValue />
        ) : (
          <div className='ab-whitespace-pre-wrap ab-text-sm'>{commentText}</div>
        )}
      </div>
    </div>
  );
}

export function CommentItem({ commentId }: PlateCommentProps) {
  const comment = useCommentById(commentId);

  if (!comment) return null;

  return (
    <CommentProvider id={commentId} key={commentId}>
      <CommentItemContent />
    </CommentProvider>
  );
}
