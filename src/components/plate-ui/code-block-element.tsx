'use client';

import React from 'react';

import { cn, withRef } from '@udecode/cn';
import { useCodeBlockElementState } from '@udecode/plate-code-block';
import { PlateElement } from '@udecode/plate-common';

import { CodeBlockCombobox } from './code-block-combobox';

import './code-block-element.css';

export const CodeBlockElement = withRef<typeof PlateElement>(
  ({ children, className, ...props }, ref) => {
    const { element } = props;
    const state = useCodeBlockElementState({ element });

    return (
      <PlateElement
        className={cn('ab-relative ab-py-1', state.className, className)}
        ref={ref}
        {...props}
      >
        <pre className='ab-overflow-x-auto ab-rounded-md ab-bg-muted ab-px-6 ab-py-8 ab-font-mono ab-text-sm ab-leading-[normal] [tab-size:ab-2]'>
          <code>{children}</code>
        </pre>

        {state.syntax && (
          <div
            className='ab-absolute ab-right-2 ab-top-2 ab-z-10 ab-select-none'
            contentEditable={false}
          >
            <CodeBlockCombobox />
          </div>
        )}
      </PlateElement>
    );
  }
);
