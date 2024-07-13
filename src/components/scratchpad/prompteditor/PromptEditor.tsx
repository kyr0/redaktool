import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import { useCallback, useRef } from "react";

export interface PromptEditorProps {
  darkMode?: boolean;
  className?: string;
  value: string;
  onChange: (value: string) => void;
}

export const PromptEditor = ({
  onChange,
  value,
  className,
  darkMode,
}: PromptEditorProps) => {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  const handleEditorWillMount = (monaco: any) => {
    // here is the monaco instance
    // do something before editor is mounted
    //monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);

    monaco.config({
      urls: {
        monacoLoader: "./node_modules/monaco-editor/min/vs/loader.js",
        monacoBase: "./node_modules/monaco-editor/min/vs",
      },
    });

    monaco.languages.register({ id: "liquid" });

    monaco.languages.registerCompletionItemProvider("liquid", {
      provideCompletionItems: () => {
        const autocompleteProviderItems = [];
        const keywords = [
          "assign",
          "capture",
          "endcapture",
          "increment",
          "decrement",
          "if",
          "else",
          "elsif",
          "endif",
          "for",
          "field",
          "endfor",
          "break",
          "continue",
          "limit",
          "offset",
          "range",
          "reversed",
          "cols",
          "case",
          "endcase",
          "when",
          "block",
          "endblock",
          "true",
          "false",
          "in",
          "unless",
          "endunless",
          "cycle",
          "tablerow",
          "endtablerow",
          "contains",
          "startswith",
          "endswith",
          "comment",
          "endcomment",
          "raw",
          "endraw",
          "editable",
          "endentitylist",
          "endentityview",
          "endinclude",
          "endmarker",
          "entitylist",
          "entityview",
          "forloop",
          "image",
          "include",
          "marker",
          "outputcache",
          "plugin",
          "style",
          "text",
          "widget",
          "abs",
          "append",
          "at_least",
          "at_most",
          "capitalize",
          "ceil",
          "compact",
          "concat",
          "date",
          "default",
          "divided_by",
          "downcase",
          "escape",
          "escape_once",
          "first",
          "floor",
          "join",
          "last",
          "lstrip",
          "map",
          "minus",
          "modulo",
          "newline_to_br",
          "plus",
          "prepend",
          "remove",
          "remove_first",
          "replace",
          "replace_first",
          "reverse",
          "round",
          "rstrip",
          "size",
          "slice",
          "sort",
          "sort_natural",
          "split",
          "strip",
          "strip_html",
          "strip_newlines",
          "times",
          "truncate",
          "truncatewords",
          "uniq",
          "upcase",
          "url_decode",
          "url_encode",
        ];

        for (let i = 0; i < keywords.length; i++) {
          autocompleteProviderItems.push({
            label: keywords[i],
            kind: monaco.languages.CompletionItemKind.Keyword,
          });
        }

        return { suggestions: autocompleteProviderItems };
      },
    });
  };

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      onChange(value || "");
    },
    [onChange],
  );

  return (
    <Editor
      theme={darkMode ? "vs-dark" : "light"}
      className={className}
      beforeMount={handleEditorWillMount}
      onMount={handleEditorDidMount}
      defaultLanguage="liquid"
      defaultValue={value}
      onChange={handleEditorChange}
    />
  );
};
