'use client';

import * as React from 'react';

import * as ToolbarPrimitive from '@radix-ui/react-toolbar';
import { cn, withCn, withRef, withVariants } from '@udecode/cn';
import { type VariantProps, cva } from 'class-variance-authority';

import { Icons } from '@/components/icons';

import { Separator } from './separator';
import { withTooltip } from './tooltip';

export const Toolbar = withCn(
  ToolbarPrimitive.Root,
  'relative flex select-none items-center gap-1 bg-background'
);

export const ToolbarToggleGroup = withCn(
  ToolbarPrimitive.ToolbarToggleGroup,
  'flex items-center'
);

export const ToolbarLink = withCn(
  ToolbarPrimitive.Link,
  'font-medium underline underline-offset-4'
);

export const ToolbarSeparator = withCn(
  ToolbarPrimitive.Separator,
  'my-1 w-px shrink-0 bg-border'
);

const toolbarButtonVariants = cva(
  cn(
    'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    '[&_svg:not([data-icon])]:size-5'
  ),
  {
    defaultVariants: {
      size: 'sm',
      variant: 'default',
    },
    variants: {
      size: {
        default: 'ab-h-10 ab-px-3',
        lg: 'ab-h-11 ab-px-5',
        sm: 'ab-h-9 ab-px-2',
      },
      variant: {
        default:
          'ab-bg-transparent hover:ab-bg-muted hover:ab-text-muted-foreground aria-checked:ab-bg-accent aria-checked:ab-text-accent-foreground',
        outline:
          'ab-border ab-border-input ab-bg-transparent hover:ab-bg-accent hover:ab-text-accent-foreground',
      },
    },
  }
);

const ToolbarButton = withTooltip(
  // eslint-disable-next-line react/display-name
  React.forwardRef<
    React.ElementRef<typeof ToolbarToggleItem>,
    {
      isDropdown?: boolean;
      pressed?: boolean;
    } & Omit<
      React.ComponentPropsWithoutRef<typeof ToolbarToggleItem>,
      'asChild' | 'value'
    > &
      VariantProps<typeof toolbarButtonVariants>
  >(
    (
      { children, className, isDropdown, pressed, size, variant, ...props },
      ref
    ) => {
      return typeof pressed === 'boolean' ? (
        <ToolbarToggleGroup
          disabled={props.disabled}
          type="single"
          value="single"
        >
          <ToolbarToggleItem
            className={cn(
              toolbarButtonVariants({
                size,
                variant,
              }),
              isDropdown && 'ab-my-1 ab-justify-between ab-pr-1',
              className
            )}
            ref={ref}
            value={pressed ? 'single' : ''}
            {...props}
          >
            {isDropdown ? (
              <>
                <div className='ab-flex ab-flex-1'>{children}</div>
                <div>
                  <Icons.arrowDown className='ab-ml-0.5 ab-size-4' data-icon />
                </div>
              </>
            ) : (
              children
            )}
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
      ) : (
        <ToolbarPrimitive.Button
          className={cn(
            toolbarButtonVariants({
              size,
              variant,
            }),
            isDropdown && 'ab-pr-1',
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </ToolbarPrimitive.Button>
      );
    }
  )
);
ToolbarButton.displayName = 'ToolbarButton';

export { ToolbarButton };

export const ToolbarToggleItem = withVariants(
  ToolbarPrimitive.ToggleItem,
  toolbarButtonVariants,
  ['variant', 'size']
);

export const ToolbarGroup = withRef<
  'div',
  {
    noSeparator?: boolean;
  }
>(({ children, className, noSeparator }, ref) => {
  const childArr = React.Children.map(children, (c) => c);

  if (!childArr || childArr.length === 0) return null;

  return (
    <div className={cn('ab-flex', className)} ref={ref}>
      {!noSeparator && (
        <div className='ab-h-full ab-py-1'>
          <Separator orientation="vertical" />
        </div>
      )}

      <div className='ab-mx-1 ab-flex ab-items-center ab-gap-1'>{children}</div>
    </div>
  );
});
