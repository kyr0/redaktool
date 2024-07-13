import { useCallback, useEffect, useRef, useState } from "react";
import {
  liquidLanguage,
  liquidCompletionSource,
  liquid,
  closePercentBrace,
  type LiquidCompletionConfig,
} from "@codemirror/lang-liquid";
import {
  defaultHighlightStyle,
  syntaxHighlighting,
  indentOnInput,
  bracketMatching,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import { EditorView, basicSetup } from "codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorState } from "@codemirror/state";

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
  const editor = useRef(null);
  const [code, setCode] = useState(value);
  console.log("PromptEditor", editor.current);

  useEffect(() => {
    onChange(code);
  }, [code]);

  const onUpdate = EditorView.updateListener.of((v) => {
    setCode(v.state.doc.toString());
  });

  useEffect(() => {
    // editor.current.addEventListener("input", log);

    if (!editor.current) {
      return;
    }
    console.log("editor.current", editor.current);

    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        liquid(),
        onUpdate,
        //oneDark,
        /*
        keymap.of([...defaultKeymap, indentWithTab]),
        */
      ],
    });
    console.log("PromptEditor: state", state);
    const view = new EditorView({ state, parent: editor.current });

    return () => {
      view.destroy();
      // editor.current.removeEventListener("input", log);
    };
  }, [value, editor.current]);

  return <div className={className} ref={editor} />;
};
