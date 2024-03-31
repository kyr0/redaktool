import * as ResizablePrimitive from "react-resizable-panels"
import { cn } from "../lib/content-script/utils"
import { DragHandleDots2Icon } from "@radix-ui/react-icons"

const ResizablePanelGroup = ({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) => (
  <ResizablePrimitive.PanelGroup
    className={cn(
      "ab-flex ab-h-full ab-w-full data-[panel-group-direction=vertical]:ab-flex-col",
      className
    )}
    {...props}
  />
)
 
const ResizablePanel = ResizablePrimitive.Panel
 
export const VerticalResizeHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) => {
  return (
    <ResizableHandle direction="vertical" withHandle style={{ width: '100%', height: 1, marginTop: 10, marginBottom: 10 }} />
  )
}

const ResizableHandle = ({
  withHandle,
  direction,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
  direction?: "horizontal" | "vertical"
}) => (
  <ResizablePrimitive.PanelResizeHandle
    className={cn(
      `ab-relative ab-flex ab-w-px ab-items-center ab-justify-center ab-bg-border after:ab-absolute after:ab-inset-y-0 after:ab-left-1/2 after:ab-w-1 after:-ab-translate-x-1/2 focus-visible:ab-outline-none focus-visible:ab-ring-1 focus-visible:ab-ring-ring focus-visible:ab-ring-offset-1 data-[panel-group-direction=vertical]:ab-h-px data-[panel-group-direction=vertical]:ab-w-full data-[panel-group-direction=vertical]:after:ab-left-0 data-[panel-group-direction=vertical]:after:ab-h-1 data-[panel-group-direction=vertical]:after:ab-w-full data-[panel-group-direction=vertical]:after:-ab-translate-y-1/2 data-[panel-group-direction=vertical]:after:ab-translate-x-0 [&[data-panel-group-direction=vertical]>div]:ab-rotate-90  ${direction === "vertical" ? 'ab-w-[100%] ab-h-[1px]': ''}`,
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className={`ab-z-10 ab-flex ab-h-4 ab-w-3 ab-items-center ab-justify-center ab-rounded-sm ab-border ab-bg-border ${direction === "vertical" ? 'ab-rotate-90': ''}`}>
        <DragHandleDots2Icon className="ab-h-2.5 ab-w-2.5" />
      </div>
    )}
  </ResizablePrimitive.PanelResizeHandle>
)
 
export { ResizablePanelGroup, ResizablePanel, ResizableHandle }