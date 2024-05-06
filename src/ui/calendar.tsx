import type * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "../lib/content-script/utils";
import { buttonVariants } from "./button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("ab-p-3", className)}
      classNames={{
        months:
          "ab-flex ab-flex-col sm:ab-flex-row ab-space-y-4 sm:ab-space-x-4 sm:ab-space-y-0",
        month: "ab-space-y-4",
        caption:
          "ab-flex ab-justify-center ab-pt-1 ab-relative ab-items-center",
        caption_label: "ab-text-sm ab-font-medium",
        nav: "ab-space-x-1 ab-flex ab-items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "ab-h-7 ab-w-7 ab-bg-transparent ab-p-0 ab-opacity-50 hover:ab-opacity-100",
        ),
        nav_button_previous: "ab-absolute ab-left-1",
        nav_button_next: "ab-absolute ab-right-1",
        table: "ab-w-full ab-border-collapse ab-space-y-1",
        head_row: "ab-flex",
        head_cell:
          "ab-text-muted-foreground ab-rounded-md ab-w-9 ab-font-normal ab-text-[0.8rem]",
        row: "ab-flex ab-w-full ab-mt-2",
        cell: "ab-h-9 ab-w-9 ab-text-center ab-text-sm ab-p-0 ab-relative [&:has([aria-selected].day-range-end)]:ab-rounded-r-md [&:has([aria-selected].day-outside)]:ab-bg-accent/50 [&:has([aria-selected])]:ab-bg-accent first:[&:has([aria-selected])]:ab-rounded-l-md last:[&:has([aria-selected])]:ab-rounded-r-md focus-within:ab-relative focus-within:ab-z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "ab-h-9 ab-w-9 ab-p-0 ab-font-normal aria-selected:ab-opacity-100",
        ),
        day_range_end: "ab-day-range-end",
        day_selected:
          "ab-bg-primary ab-text-primary-foreground hover:ab-bg-primary hover:ab-text-primary-foreground focus:ab-bg-primary focus:ab-text-primary-foreground",
        day_today: "ab-bg-accent ab-text-accent-foreground",
        day_outside:
          "ab-day-outside ab-text-muted-foreground ab-opacity-50 aria-selected:ab-bg-accent/50 aria-selected:ab-text-muted-foreground aria-selected:ab-opacity-30",
        day_disabled: "ab-text-muted-foreground ab-opacity-50",
        day_range_middle:
          "aria-selected:ab-bg-accent aria-selected:ab-text-accent-foreground",
        day_hidden: "ab-invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="ab-h-4 ab-w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="ab-h-4 ab-w-4" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
