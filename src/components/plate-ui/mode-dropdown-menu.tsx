import React from 'react';

import type { DropdownMenuProps } from '@radix-ui/react-dropdown-menu';

import {
  focusEditor,
  useEditorReadOnly,
  useEditorRef,
  usePlateStore,
} from '@udecode/plate-common';

import { Icons } from '@/components/icons';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from './dropdown-menu';
import { ToolbarButton } from './toolbar';

export function ModeDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const setReadOnly = usePlateStore().set.readOnly();
  const readOnly = useEditorReadOnly();
  const openState = useOpenState();

  let value = 'editing';

  if (readOnly) value = 'viewing';

  const item: any = {
    editing: (
      <>
        <Icons.editing className='ab-mr-2 ab-size-5' />
        <span className='ab-hidden lg:ab-inline'>Editing</span>
      </>
    ),
    viewing: (
      <>
        <Icons.viewing className='ab-mr-2 ab-size-5' />
        <span className='ab-hidden lg:ab-inline'>Viewing</span>
      </>
    ),
  };

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton
          className='ab-min-w-[auto] lg:ab-min-w-[130px]'
          isDropdown
          pressed={openState.open}
          tooltip="Editing mode"
        >
          {item[value]}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className='ab-min-w-[180px]'>
        <DropdownMenuRadioGroup
          className='ab-flex ab-flex-col ab-gap-0.5'
          onValueChange={(newValue) => {
            if (newValue !== 'viewing') {
              setReadOnly(false);
            }
            if (newValue === 'viewing') {
              setReadOnly(true);

              return;
            }
            if (newValue === 'editing') {
              focusEditor(editor);

              return;
            }
          }}
          value={value}
        >
          <DropdownMenuRadioItem value="editing">
            {item.editing}
          </DropdownMenuRadioItem>

          <DropdownMenuRadioItem value="viewing">
            {item.viewing}
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
