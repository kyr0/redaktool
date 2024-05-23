import { withVariants } from '@udecode/cn';
import { cva } from 'class-variance-authority';

export const inputVariants = cva(
  'ab-flex ab-w-full ab-rounded-md ab-bg-transparent ab-text-sm file:ab-border-0 file:ab-bg-background file:ab-text-sm file:ab-font-medium placeholder:ab-text-muted-foreground focus-visible:ab-outline-none disabled:ab-cursor-not-allowed disabled:ab-opacity-50',
  {
    defaultVariants: {
      h: 'md',
      variant: 'default',
    },
    variants: {
      h: {
        md: 'ab-h-10 ab-px-3 ab-py-2',
        sm: 'ab-h-9 ab-px-3 ab-py-2',
      },
      variant: {
        default:
          'ab-border ab-border-input ab-ring-offset-background focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2',
        ghost: 'ab-border-none focus-visible:ab-ring-transparent',
      },
    },
  }
);

export const Input = withVariants('input', inputVariants, ['variant', 'h']);
