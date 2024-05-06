import * as React from "react";
import type { DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "../lib/content-script/utils";
import { Dialog, DialogContent } from "./dialog";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "ab-flex ab-h-full ab-w-full ab-flex-col ab-overflow-hidden ab-rounded-md ab-bg-popover ab-text-popover-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

interface CommandDialogProps extends DialogProps {}

const CommandDialog = ({ children, ...props }: CommandDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="ab-overflow-hidden ab-p-0 ab-shadow-lg">
        <Command className="[&_[cmdk-group-heading]]:ab-px-2 [&_[cmdk-group-heading]]:ab-font-medium [&_[cmdk-group-heading]]:ab-text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:ab-pt-0 [&_[cmdk-group]]:ab-px-2 [&_[cmdk-input-wrapper]_svg]:ab-h-5 [&_[cmdk-input-wrapper]_svg]:ab-w-5 [&_[cmdk-input]]:ab-h-12 [&_[cmdk-item]]:ab-px-2 [&_[cmdk-item]]:ab-py-3 [&_[cmdk-item]_svg]:ab-h-5 [&_[cmdk-item]_svg]:ab-w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div
    className="ab-flex ab-items-center ab-border-b ab-px-3"
    cmdk-input-wrapper=""
  >
    <Search className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0 ab-opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "ab-flex ab-h-11 ab-w-full ab-rounded-md ab-bg-transparent ab-py-3 ab-text-sm ab-outline-none placeholder:ab-text-muted-foreground disabled:ab-cursor-not-allowed disabled:ab-opacity-50",
        className,
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "ab-max-h-[300px] ab-overflow-y-auto ab-overflow-x-hidden",
      className,
    )}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="ab-py-6 ab-text-center ab-text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "ab-overflow-hidden ab-p-1 ab-text-foreground [&_[cmdk-group-heading]]:ab-px-2 [&_[cmdk-group-heading]]:ab-py-1.5 [&_[cmdk-group-heading]]:ab-text-xs [&_[cmdk-group-heading]]:ab-font-medium [&_[cmdk-group-heading]]:ab-text-muted-foreground",
      className,
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-wysiwygmx-1 ab-h-px ab-bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "ab-relative ab-flex ab-cursor-pointer ab-select-none ab-items-center ab-rounded-sm ab-px-2 ab-py-1.5 ab-text-sm ab-outline-none aria-selected:ab-bg-accent aria-selected:ab-text-accent-foreground data-[disabled]:ab-pointer-events-none data-[disabled]:ab-opacity-50",
      className,
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ab-ml-auto ab-text-xs ab-tracking-widest ab-text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
