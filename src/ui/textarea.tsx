import * as React from "react";

import { cn } from "../lib/content-script/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "ab-flex ab-min-h-[80px] ab-w-full ab-rounded-md ab-border ab-border-input ab-bg-background ab-px-3 ab-py-2 ab-text-sm ab-ring-offset-background placeholder:ab-text-muted-foreground focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-cursor-not-allowed disabled:ab-opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea };
