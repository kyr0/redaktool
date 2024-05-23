'use client';

import React from 'react';

import type {
  ClassNames,
  PlateElementProps,
  TEditor,
} from '@udecode/plate-common';
import type { DropTargetMonitor } from 'react-dnd';

import { cn, withRef } from '@udecode/cn';
import {
  type DragItemNode,
  useDraggable,
  useDraggableState,
} from '@udecode/plate-dnd';

import { Icons } from '@/components/icons';

import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

export interface DraggableProps
  extends PlateElementProps,
    ClassNames<{
      /** Block. */
      block: string;

      /** Block and gutter. */
      blockAndGutter: string;

      /** Block toolbar in the gutter. */
      blockToolbar: string;

      /**
       * Block toolbar wrapper in the gutter left. It has the height of a line
       * of the block.
       */
      blockToolbarWrapper: string;

      blockWrapper: string;

      /** Button to dnd the block, in the block toolbar. */
      dragHandle: string;

      /** Icon of the drag button, in the drag icon. */
      dragIcon: string;

      /** Show a dropline above or below the block when dragging a block. */
      dropLine: string;

      /** Gutter at the left side of the editor. It has the height of the block */
      gutterLeft: string;
    }> {
  /**
   * Intercepts the drop handling. If `false` is returned, the default drop
   * behavior is called after. If `true` is returned, the default behavior is
   * not called.
   */
  onDropHandler?: (
    editor: TEditor,
    props: {
      dragItem: DragItemNode;
      id: string;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: any;
    }
  ) => boolean;
}

const dragHandle = (
  <Tooltip>
    <TooltipTrigger>
      <Icons.dragHandle className='ab-size-4 ab-text-muted-foreground' />
    </TooltipTrigger>
    <TooltipContent>Drag to move</TooltipContent>
  </Tooltip>
);

export const Draggable = withRef<'div', DraggableProps>(
  ({ className, classNames = {}, onDropHandler, ...props }, ref) => {
    const { children, element } = props;

    const state = useDraggableState({ element, onDropHandler });
    const { dropLine, isDragging, isHovered } = state;
    const {
      droplineProps,
      groupProps,
      gutterLeftProps,
      handleRef,
      previewRef,
    } = useDraggable(state);

    return (
      <div
        className={cn(
          'ab-relative',
          isDragging && 'ab-opacity-50',
          'ab-group',
          className
        )}
        ref={ref}
        {...groupProps}
      >
        <div
          className={cn(
            'ab-pointer-events-none ab-absolute ab-top-0 ab-flex ab-h-full ab--translate-x-full ab-cursor-text ab-opacity-0 group-hover:ab-opacity-100',
            classNames.gutterLeft
          )}
          {...gutterLeftProps}
        >
          <div className={cn('ab-flex ab-h-[1.5em]', classNames.blockToolbarWrapper)}>
            <div
              className={cn(
                'ab-pointer-events-auto ab-mr-1 ab-flex ab-items-center',
                classNames.blockToolbar
              )}
            >
              <div className='ab-size-4' ref={handleRef}>
                {isHovered && dragHandle}
              </div>
            </div>
          </div>
        </div>

        <div className={classNames.blockWrapper} ref={previewRef}>
          {children}

          {!!dropLine && (
            <div
              className={cn(
                'ab-absolute ab-inset-x-0 ab-h-0.5 ab-opacity-100',
                'ab-bg-ring',
                dropLine === 'top' && 'ab--top-px',
                dropLine === 'bottom' && 'ab--bottom-px',
                classNames.dropLine
              )}
              {...droplineProps}
            />
          )}
        </div>
      </div>
    );
  }
);
