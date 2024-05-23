import React from 'react';

import { cn, withProps, withRef } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';
import {
  useTableCellElement,
  useTableCellElementResizable,
  useTableCellElementResizableState,
  useTableCellElementState,
} from '@udecode/plate-table';

import { ResizeHandle } from './resizable';

export const TableCellElement = withRef<
  typeof PlateElement,
  {
    hideBorder?: boolean;
    isHeader?: boolean;
  }
>(({ children, className, hideBorder, isHeader, style, ...props }, ref) => {
  const { element } = props;

  const {
    borders,
    colIndex,
    colSpan,
    hovered,
    hoveredLeft,
    isSelectingCell,
    readOnly,
    rowIndex,
    rowSize,
    selected,
  } = useTableCellElementState();
  const { props: cellProps } = useTableCellElement({ element: props.element });
  const resizableState = useTableCellElementResizableState({
    colIndex,
    colSpan,
    rowIndex,
  });

  const { bottomProps, hiddenLeft, leftProps, rightProps } =
    useTableCellElementResizable(resizableState);

  const Cell = isHeader ? 'th' : 'td';

  return (
    <PlateElement
      asChild
      className={cn(
        'ab-relative ab-h-full ab-overflow-visible ab-border-none ab-bg-background ab-p-0',
        hideBorder && 'before:ab-border-none',
        element.background ? 'ab-bg-[--cellBackground]' : 'ab-bg-background',
        !hideBorder &&
          cn(
            isHeader && 'text-left [&_>_*]:m-0',
            'before:size-full',
            selected && 'before:z-10 before:bg-muted',
            "before:absolute before:box-border before:select-none before:content-['']",
            borders &&
              cn(
                borders.bottom?.size &&
                  `before:border-b before:border-b-border`,
                borders.right?.size && `before:border-r before:border-r-border`,
                borders.left?.size && `before:border-l before:border-l-border`,
                borders.top?.size && `before:border-t before:border-t-border`
              )
          ),
        className
      )}
      ref={ref}
      {...cellProps}
      {...props}
      style={
        {
          '--cellBackground': element.background,
          ...style,
        } as React.CSSProperties
      }
    >
      <Cell>
        <div
          className='ab-relative ab-z-20 ab-box-border ab-h-full ab-px-3 ab-py-2'
          style={{
            minHeight: rowSize,
          }}
        >
          {children}
        </div>

        {!isSelectingCell && (
          <div
            className='ab-group ab-absolute ab-top-0 ab-size-full ab-select-none'
            contentEditable={false}
            suppressContentEditableWarning={true}
          >
            {!readOnly && (
              <>
                <ResizeHandle
                  {...rightProps}
                  className='ab--top-3 ab-right-[-5px] ab-w-[10px]'
                />
                <ResizeHandle
                  {...bottomProps}
                  className='ab-bottom-[-5px] ab-h-[10px]'
                />
                {!hiddenLeft && (
                  <ResizeHandle
                    {...leftProps}
                    className='ab--top-3 ab-left-[-5px] ab-w-[10px]'
                  />
                )}

                {hovered && (
                  <div
                    className={cn(
                      'ab-absolute ab--top-3 ab-z-30 ab-h-[calc(100%_+_12px)] ab-w-1 ab-bg-ring',
                      'ab-right-[-1.5px]'
                    )}
                  />
                )}
                {hoveredLeft && (
                  <div
                    className={cn(
                      'ab-absolute ab--top-3 ab-z-30 ab-h-[calc(100%_+_12px)] ab-w-1 ab-bg-ring',
                      'ab-left-[-1.5px]'
                    )}
                  />
                )}
              </>
            )}
          </div>
        )}
      </Cell>
    </PlateElement>
  );
});

TableCellElement.displayName = 'TableCellElement';

export const TableCellHeaderElement = withProps(TableCellElement, {
  isHeader: true,
});
