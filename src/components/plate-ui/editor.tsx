import React from 'react';

import type { PlateContentProps } from '@udecode/plate-common';
import type { VariantProps } from 'class-variance-authority';

import { cn } from '@udecode/cn';
import { PlateContent } from '@udecode/plate-common';
import { cva } from 'class-variance-authority';

const editorVariants = cva(
  cn(
    'relative overflow-x-auto whitespace-pre-wrap break-words',
    'min-h-[80px] w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none',
    '[&_[data-slate-placeholder]]:text-muted-foreground [&_[data-slate-placeholder]]:!opacity-100',
    '[&_[data-slate-placeholder]]:top-[auto_!important]',
    '[&_strong]:font-bold'
  ),
  {
    defaultVariants: {
      focusRing: true,
      size: 'sm',
      variant: 'outline',
    },
    variants: {
      disabled: {
        true: 'ab-cursor-not-allowed ab-opacity-50',
      },
      focusRing: {
        false: 'ab-',
        true: 'focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2',
      },
      focused: {
        true: 'ab-ring-2 ab-ring-ring ab-ring-offset-2',
      },
      size: {
        md: 'ab-text-base',
        sm: 'ab-text-sm',
      },
      variant: {
        ghost: 'ab-',
        outline: 'ab-border ab-border-input',
      },
    },
  }
);

export type EditorProps = PlateContentProps &
  VariantProps<typeof editorVariants>;

const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  (
    {
      className,
      disabled,
      focusRing,
      focused,
      readOnly,
      size,
      variant,
      ...props
    },
    ref
  ) => {
    return (
      <div className='ab-relative ab-w-full' ref={ref}>
        <PlateContent
          aria-disabled={disabled}
          className={cn(
            editorVariants({
              disabled,
              focusRing,
              focused,
              size,
              variant,
            }),
            className
          )}
          disableDefaultStyles
          readOnly={disabled ?? readOnly}
          {...props}
        />
      </div>
    );
  }
);
Editor.displayName = 'Editor';

export { Editor };
