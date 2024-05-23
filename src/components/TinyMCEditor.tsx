import type { MarkdownEditorProps } from "./MarkdownEditor";
import { useEffect, useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

export const TinyMCEditor: React.FC<MarkdownEditorProps> = ({
  name,
  defaultValue = "",
  showToolbar,
  placeholder,
  onChange,
}: MarkdownEditorProps) => {
  const [data, setData] = useState("<p>Initial content</p>");

  // @ts-ignore
  console.log("window.tinymce", window.tinymce);
  return (
    <div>
      <Editor
        value={data}
        inline={true}
        plugins={["quickbars"]}
        init={{
          inline: true,
          skin: false,
          menubar: true,
          height: "100%",
          content_style:
            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          toolbar: showToolbar
            ? "undo redo | formatselect | " +
              "bold italic | alignleft aligncenter " +
              "alignright alignjustify | bullist numlist outdent indent | " +
              "removeformat | help"
            : false,
        }}
        onInit={() => {
          console.log("Editor is ready to use");
        }}
        onEditorChange={(e) => {
          setData(e);
          //onChange(e);
        }}
      />
    </div>
  );
};
