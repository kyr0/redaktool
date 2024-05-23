import { withRef } from '@udecode/cn';
import { PlateElement, useElement } from '@udecode/plate-common';
import { useToggleButton, useToggleButtonState } from '@udecode/plate-toggle';

import { Icons } from '@/components/icons';

export const ToggleElement = withRef<typeof PlateElement>(
  ({ children, ...props }, ref) => {
    const element = useElement();
    const state = useToggleButtonState(element.id as string);
    const { buttonProps, open } = useToggleButton(state);

    return (
      <PlateElement asChild ref={ref} {...props}>
        <div className='ab-relative ab-pl-6'>
          <span
            className='ab-absolute ab--left-0.5 ab--top-0.5 ab-flex ab-cursor-pointer ab-select-none ab-items-center ab-justify-center ab-rounded-sm ab-p-px ab-transition-colors hover:ab-bg-slate-200'
            contentEditable={false}
            {...buttonProps}
          >
            {open ? <Icons.chevronDown /> : <Icons.chevronRight />}
          </span>
          {children}
        </div>
      </PlateElement>
    );
  }
);
