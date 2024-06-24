import { cn } from "../lib/content-script/utils";
import { forwardRef } from "react";
import { LoaderIcon } from "lucide-react";

const spinnerVariants =
  // radar: "ab-w-16 ab-h-16 ab-border-4 ab-border-t-4 ab-border-gray-200 ab-border-t-gray-600 ab-rounded-full ab-animate-spin";
  "ab-w-16 ab-h-16 ab-rounded-full ab-animate-spin";

interface LoadingSpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
  className?: string;
}

const LoadingSpinner = forwardRef<SVGSVGElement, LoadingSpinnerProps>(
  (props, ref) => {
    const { className, ...rest } = props;
    return (
      <LoaderIcon
        ref={ref}
        className={cn(spinnerVariants, className)}
        {...rest}
      />
    );
  },
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
