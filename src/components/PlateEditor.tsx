import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import type { MarkdownEditorProps } from "./MarkdownEditor";
import { CommentsProvider } from "@udecode/plate-comments";
import { Plate } from "@udecode/plate-common";
import { plugins } from "./editor/plugins";
import { Editor } from "@/components/plate-ui/editor";
import { FixedToolbar } from "@/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "@/components/plate-ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "@/components/plate-ui/floating-toolbar";
import { FloatingToolbarButtons } from "@/components/plate-ui/floating-toolbar-buttons";
import { MentionCombobox } from "@/components/plate-ui/mention-combobox";
import { CommentsPopover } from "@/components/plate-ui/comments-popover";
import { TooltipProvider } from "@/components/plate-ui/tooltip";
import { useRef, useState } from "react";

export const PlateEditor: React.FC<MarkdownEditorProps> = ({
  name,
  defaultValue = "",
  showToolbar,
  placeholder,
  onChange,
}: MarkdownEditorProps) => {
  const initialValue = [
    {
      id: "1",
      type: "p",
      children: [{ text: "Hello, World!" }],
    },
  ];

  return (
    <TooltipProvider>
      <DndProvider backend={HTML5Backend}>
        <CommentsProvider users={{}} myUserId="1">
          <Plate plugins={plugins} initialValue={initialValue}>
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>

            <Editor />

            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>
            <MentionCombobox items={[]} />
            <CommentsPopover />
          </Plate>
        </CommentsProvider>
      </DndProvider>
    </TooltipProvider>
  );
};
