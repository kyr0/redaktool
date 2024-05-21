import {
  type MultiRootHookProps,
  useMultiRootEditor,
} from "@ckeditor/ckeditor5-react";
import MultiRootEditor from "@ckeditor/ckeditor5-build-multi-root";
import type { MarkdownEditorProps } from "./MarkdownEditor";
import { useEffect } from "react";
import {
  PasteFromMarkdownExperimental,
  Markdown,
} from "@ckeditor/ckeditor5-markdown-gfm";
import { Bold, Italic } from "@ckeditor/ckeditor5-basic-styles";
import { Essentials } from "@ckeditor/ckeditor5-essentials";
import { SourceEditing } from "@ckeditor/ckeditor5-source-editing";
import { Autoformat } from "@ckeditor/ckeditor5-autoformat";

export const CKEditor: React.FC<MarkdownEditorProps> = ({
  name,
  defaultValue = "",
  showToolbar,
  placeholder,
  onChange,
}: MarkdownEditorProps) => {
  const editorProps: MultiRootHookProps = {
    editor: MultiRootEditor,

    onChange: (event, editor) => {
      const data = editor.getData();
      console.log("ckeditor data change", data);
      onChange(data);
    },
    onBlur: (event, editor) => {
      console.log("ckeditor blur", editor.getData());
    },
    onFocus: (event, editor) => {
      console.log("ckeditor focus", editor.getData());
    },
    onReady: (editor) => {
      console.log("ckeditor ready", editor.getData());
    },
    onError: (error) => {
      console.error("ckeditor error", error);
    },
    data: {
      intro: "<h1>React multi-root editor</h1>",
      content: "<p>Hello from CKEditor&nbsp;5 multi-root!</p>",
    },
    config: {
      toolbar: ["sourceEditing", "|", "bold", "italic"],
      plugins: [
        PasteFromMarkdownExperimental,
        Markdown,
        Autoformat,
        SourceEditing,
        Essentials,
        Bold,
        Italic,
      ],
      placeholder,
    },
  };

  const {
    editor,
    toolbarElement,
    editableElements,
    data,
    setData,
    attributes,
    setAttributes,
  } = useMultiRootEditor(editorProps);

  useEffect(() => {
    setData({
      intro: "<h1>React multi-root editor</h1>",
      content: defaultValue,
    });
  }, [defaultValue, setData]);

  // TODO: fb cb for selection change and replace
  /**
   * editor.model.change( writer => {
    const range = editor.model.document.selection.getFirstRange();

    editor.model.insertContent( writer.createText( 'Text to insert' ), range )
} );
   */

  useEffect(() => {
    editor?.model.document.selection.on("change", (eventInfo, batch) => {
      console.log("selection change", eventInfo, batch);
    });
    console.log("editor instance", editor);
  }, [editor]);

  return (
    <div id={`ckeditor_${name}`} className="CKEditor">
      {showToolbar && toolbarElement}
      {editableElements}
    </div>
  );
};
