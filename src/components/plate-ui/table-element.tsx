import React from 'react';

import type * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';

import { PopoverAnchor } from '@radix-ui/react-popover';
import { cn, withRef } from '@udecode/cn';
import {
  PlateElement,
  isSelectionExpanded,
  useEditorRef,
  useEditorSelector,
  useElement,
  useRemoveNodeButton,
  withHOC,
} from '@udecode/plate-common';
import {
  type TTableElement,
  TableProvider,
  mergeTableCells,
  unmergeTableCells,
  useTableBordersDropdownMenuContentState,
  useTableElement,
  useTableElementState,
  useTableMergeState,
} from '@udecode/plate-table';
import { useReadOnly, useSelected } from 'slate-react';

import { Icons, iconVariants } from '@/components/icons';

import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Popover, PopoverContent, popoverVariants } from './popover';
import { Separator } from './separator';

export const TableBordersDropdownMenuContent = withRef<
  typeof DropdownMenuPrimitive.Content
>((props, ref) => {
  const {
    getOnSelectTableBorder,
    hasBottomBorder,
    hasLeftBorder,
    hasNoBorders,
    hasOuterBorders,
    hasRightBorder,
    hasTopBorder,
  } = useTableBordersDropdownMenuContentState();

  return (
    <DropdownMenuContent
      align="start"
      className={cn('ab-min-w-[220px]')}
      ref={ref}
      side="right"
      sideOffset={0}
      {...props}
    >
      <DropdownMenuCheckboxItem
        checked={hasBottomBorder}
        onCheckedChange={getOnSelectTableBorder('bottom')}
      >
        <Icons.borderBottom className={iconVariants({ size: 'sm' })} />
        <div>Bottom Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={hasTopBorder}
        onCheckedChange={getOnSelectTableBorder('top')}
      >
        <Icons.borderTop className={iconVariants({ size: 'sm' })} />
        <div>Top Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={hasLeftBorder}
        onCheckedChange={getOnSelectTableBorder('left')}
      >
        <Icons.borderLeft className={iconVariants({ size: 'sm' })} />
        <div>Left Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={hasRightBorder}
        onCheckedChange={getOnSelectTableBorder('right')}
      >
        <Icons.borderRight className={iconVariants({ size: 'sm' })} />
        <div>Right Border</div>
      </DropdownMenuCheckboxItem>

      <Separator />

      <DropdownMenuCheckboxItem
        checked={hasNoBorders}
        onCheckedChange={getOnSelectTableBorder('none')}
      >
        <Icons.borderNone className={iconVariants({ size: 'sm' })} />
        <div>No Border</div>
      </DropdownMenuCheckboxItem>
      <DropdownMenuCheckboxItem
        checked={hasOuterBorders}
        onCheckedChange={getOnSelectTableBorder('outer')}
      >
        <Icons.borderAll className={iconVariants({ size: 'sm' })} />
        <div>Outside Borders</div>
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  );
});

export const TableFloatingToolbar = withRef<typeof PopoverContent>(
  ({ children, ...props }, ref) => {
    const element = useElement<TTableElement>();
    const { props: buttonProps } = useRemoveNodeButton({ element });

    const selectionCollapsed = useEditorSelector(
      (editor) => !isSelectionExpanded(editor),
      []
    );

    const readOnly = useReadOnly();
    const selected = useSelected();
    const editor = useEditorRef();

    const collapsed = !readOnly && selected && selectionCollapsed;
    const open = !readOnly && selected;

    const { canMerge, canUnmerge } = useTableMergeState();

    const mergeContent = canMerge && (
      <Button
        contentEditable={false}
        isMenu
        onClick={() => mergeTableCells(editor)}
        variant="ghost"
      >
        <Icons.combine className='ab-mr-2 ab-size-4' />
        Merge
      </Button>
    );

    const unmergeButton = canUnmerge && (
      <Button
        contentEditable={false}
        isMenu
        onClick={() => unmergeTableCells(editor)}
        variant="ghost"
      >
        <Icons.ungroup className='ab-mr-2 ab-size-4' />
        Unmerge
      </Button>
    );

    const bordersContent = collapsed && (
      <>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button isMenu variant="ghost">
              <Icons.borderAll className='ab-mr-2 ab-size-4' />
              Borders
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuPortal>
            <TableBordersDropdownMenuContent />
          </DropdownMenuPortal>
        </DropdownMenu>

        <Button contentEditable={false} isMenu variant="ghost" {...buttonProps}>
          <Icons.delete className='ab-mr-2 ab-size-4' />
          Delete
        </Button>
      </>
    );

    return (
      <Popover modal={false} open={open}>
        <PopoverAnchor asChild>{children}</PopoverAnchor>
        {(canMerge || canUnmerge || collapsed) && (
          <PopoverContent
            className={cn(
              popoverVariants(),
              'ab-flex ab-w-[220px] ab-flex-col ab-gap-1 ab-p-1'
            )}
            onOpenAutoFocus={(e) => e.preventDefault()}
            ref={ref}
            {...props}
          >
            {unmergeButton}
            {mergeContent}
            {bordersContent}
          </PopoverContent>
        )}
      </Popover>
    );
  }
);

export const TableElement = withHOC(
  TableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const { colSizes, isSelectingCell, marginLeft, minColumnWidth } =
      useTableElementState();
    const { colGroupProps, props: tableProps } = useTableElement();

    return (
      <TableFloatingToolbar>
        <div style={{ paddingLeft: marginLeft }}>
          <PlateElement
            asChild
            className={cn(
              'ab-my-4 ab-ml-px ab-mr-0 ab-table ab-h-px ab-w-full ab-table-fixed ab-border-collapse',
              isSelectingCell && '[&_*::selection]:ab-bg-none',
              className
            )}
            ref={ref}
            {...tableProps}
            {...props}
          >
            <table>
              <colgroup {...colGroupProps}>
                {colSizes.map((width, index) => (
                  <col
                    key={index}
                    style={{
                      minWidth: minColumnWidth,
                      width: width || undefined,
                    }}
                  />
                ))}
              </colgroup>

              <tbody className='ab-min-w-full'>{children}</tbody>
            </table>
          </PlateElement>
        </div>
      </TableFloatingToolbar>
    );
  })
);
