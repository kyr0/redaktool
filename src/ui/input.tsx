import * as React from "react";
import { cn } from "../lib/content-script/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "ab-flex ab-h-10 ab-w-full ab-rounded-md ab-border ab-border-input ab-bg-background ab-px-3 ab-py-2 ab-text-sm ab-ring-offset-background file:ab-border-0 file:ab-bg-transparent file:ab-text-sm file:ab-font-medium placeholder:ab-text-muted-foreground focus-visible:ab-outline-none focus-visible:ab-ring-2 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-2 disabled:ab-cursor-not-allowed disabled:ab-opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
