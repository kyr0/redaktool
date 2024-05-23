import type { MarkdownEditorProps } from "./MarkdownEditor";
import { useEffect, useRef, useState } from "react";

export const QuillEditor: React.FC<MarkdownEditorProps> = ({
  name,
  defaultValue = "",
  showToolbar,
  placeholder,
  onChange,
}: MarkdownEditorProps) => {
  const [data, setData] = useState("<p>Initial content</p>");

  const editorRef = useRef<any>(null);

  useEffect(() => {
    if (editorRef.current) {
      // @ts-ignore
      const quill = new window.Quill(editorRef.current, {
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["image", "code-block"],
          ],
        },
        placeholder: "Compose an epic...",
        theme: "snow",
      });

      const normalizeNative = (nativeRange: any) => {
        // document.getSelection model has properties startContainer and endContainer
        // shadow.getSelection model has baseNode and focusNode
        // Unify formats to always look like document.getSelection

        if (nativeRange) {
          const range = nativeRange;

          if (range.baseNode) {
            range.startContainer = nativeRange.baseNode;
            range.endContainer = nativeRange.focusNode;
            range.startOffset = nativeRange.baseOffset;
            range.endOffset = nativeRange.focusOffset;

            if (range.endOffset < range.startOffset) {
              range.startContainer = nativeRange.focusNode;
              range.endContainer = nativeRange.baseNode;
              range.startOffset = nativeRange.focusOffset;
              range.endOffset = nativeRange.baseOffset;
            }
          }

          if (range.startContainer) {
            return {
              start: { node: range.startContainer, offset: range.startOffset },
              end: { node: range.endContainer, offset: range.endOffset },
              native: range,
            };
          }
        }

        return null;
      };

      // Hack Quill and replace document.getSelection with shadow.getSelection

      quill.selection.getNativeRange = () => {
        const dom = quill.root.getRootNode();
        const selection = dom.getSelection();
        const range = normalizeNative(selection);

        return range;
      };

      // Subscribe to selection change separately,
      // because emitter in Quill doesn't catch this event in Shadow DOM

      document.addEventListener("selectionchange", (...args) => {
        // Update selection and some other properties

        quill.selection.update();
      });
    }
  }, [editorRef]);

  // @ts-ignore
  console.log("window.tinymce", window.tinymce);
  return (
    <div>
      <div id="toolbar">
        <button type="button" className="ql-bold">
          Bold
        </button>
        <button type="button" className="ql-italic">
          Italic
        </button>
      </div>

      <div id="editor" ref={editorRef}>
        <p>Hello World!</p>
        <p>
          Some initial <strong>bold</strong> text
        </p>
        <p>
          <br />
        </p>
      </div>
    </div>
  );
};
