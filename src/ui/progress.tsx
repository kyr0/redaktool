import React, { useEffect, useState, useRef } from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "../lib/content-script/utils";

export const progressClasses =
  "ab-relative ab-h-4 ab-w-full ab-overflow-hidden ab-rounded-full ab-bg-secondary";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    mode?: "finite" | "infinite";
    initialSpeed?: number;
  }
>(
  (
    { className, value, mode = "finite", initialSpeed = 250, ...props },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(0);
    const [transformPercentage, setTransformPercentage] = useState(100);
    const intervalDuration = useRef(initialSpeed);
    const intervalId = useRef(null);

    const updateProgress = () => {
      setInternalValue((prevValue) => {
        const newValue = prevValue < 100 ? prevValue + 1 : 0;
        return newValue;
      });
      intervalDuration.current = Math.min(
        intervalDuration.current * 1.009,
        5000,
      ); // exponential backoff
    };

    useEffect(() => {
      if (mode === "infinite") {
        setInternalValue(0);
        intervalDuration.current = initialSpeed;

        // @ts-ignore
        clearInterval(intervalId.current);
        // @ts-ignore
        intervalId.current = setInterval(
          updateProgress,
          intervalDuration.current,
        );
      }

      // @ts-ignore
      return () => clearInterval(intervalId.current);
    }, [mode, className, initialSpeed]);

    useEffect(() => {
      const newTransformPercentage =
        mode === "infinite" ? 100 - internalValue : 100 - (value || 0);
      setTransformPercentage(newTransformPercentage);
    }, [internalValue, mode, value]);

    const transitionStyle = {
      transform: `translateX(-${transformPercentage}%)`,
      transition: `transform ${intervalDuration.current}ms linear`,
    };

    return (
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressClasses, className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className="ab-h-full ab-w-full ab-flex-1 ab-bg-primary ab-transition-all"
          style={transitionStyle}
        />
      </ProgressPrimitive.Root>
    );
  },
);

Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
