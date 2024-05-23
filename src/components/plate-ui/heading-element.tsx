import React from 'react';

import { withRef, withVariants } from '@udecode/cn';
import { PlateElement } from '@udecode/plate-common';
import { cva } from 'class-variance-authority';

const headingVariants = cva('ab-', {
  variants: {
    isFirstBlock: {
      false: 'ab-',
      true: 'ab-mt-0',
    },
    variant: {
      h1: 'ab-mb-1 ab-mt-[2em] ab-font-heading ab-text-4xl ab-font-bold',
      h2: 'ab-mb-px ab-mt-[1.4em] ab-font-heading ab-text-2xl ab-font-semibold ab-tracking-tight',
      h3: 'ab-mb-px ab-mt-[1em] ab-font-heading ab-text-xl ab-font-semibold ab-tracking-tight',
      h4: 'ab-mt-[0.75em] ab-font-heading ab-text-lg ab-font-semibold ab-tracking-tight',
      h5: 'ab-mt-[0.75em] ab-text-lg ab-font-semibold ab-tracking-tight',
      h6: 'ab-mt-[0.75em] ab-text-base ab-font-semibold ab-tracking-tight',
    },
  },
});

const HeadingElementVariants = withVariants(PlateElement, headingVariants, [
  'isFirstBlock',
  'variant',
]);

export const HeadingElement = withRef<typeof HeadingElementVariants>(
  ({ children, isFirstBlock, variant = 'h1', ...props }, ref) => {
    const { editor, element } = props;

    const Element = variant!;

    return (
      <HeadingElementVariants
        asChild
        isFirstBlock={element === editor.children[0]}
        ref={ref}
        variant={variant}
        {...props}
      >
        <Element>{children}</Element>
      </HeadingElementVariants>
    );
  }
);
