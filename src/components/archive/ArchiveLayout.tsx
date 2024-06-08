import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../ui/resizable";

export const ArchiveLayout = () => {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
          <span className="ab-font-semibold">
            TODO: Document stash with vector search (Milestone 2, Month 4)
          </span>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80} minSize={60}>
        <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
          <span className="ab-font-semibold">
            TODO: Read-only editor (with export options)
          </span>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
