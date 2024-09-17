import type { WritableAtom } from "nanostores";
import { GenericModule, type CallbackArgs } from "./GenericModule";
import { memo, useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { scrollDownMax } from "../../lib/content-script/dom";
import type { MilkdownEditorCreatedArgs } from "../MarkdownEditor";
import { db } from "../../lib/content-script/db";
import { useStore } from "@nanostores/react";
import { extractedWebsiteDataAtom } from "../AppModal";

export interface GenericPersistentModuleWrapperProps {
  isActive: boolean;
}

export interface GenericPersistentModuleProps extends GenericPersistentModuleWrapperProps {
  moduleName: string;
  placeholder: string;
  inputPlaceholder: string;
  prompt: string;
  editorAtom: WritableAtom<string>;
  inputEditorAtom: WritableAtom<string>;
}

export const GenericPersistentModule: React.FC<GenericPersistentModuleProps> = memo(
  ({ moduleName, placeholder, inputPlaceholder, prompt, editorAtom, inputEditorAtom, isActive }) => {
    const [outputDbState] = useState(db(`${moduleName}-output`));
    const [inputDbState] = useState(db(`${moduleName}-input`));
    const extractedWebsiteData$ = useStore(extractedWebsiteDataAtom);
    const [editorContent, setEditorContent] = useState(editorAtom.get());
    const [inputEditorContent, setInputEditorContent] = useState(inputEditorAtom.get());
    const [editorEl, setEditorEl] = useState<HTMLElement | null>(null);
    const [inputEditorEl, setInputEditorEl] = useState<HTMLElement | null>(null);
    const [editorArgs, setEditorArgs] = useState<MilkdownEditorCreatedArgs>();
    const [inputEditorArgs, setInputEditorArgs] = useState<MilkdownEditorCreatedArgs>();
    const [hasLoadedContent, setHasLoadedContent] = useState(false);
    const [hasLoadedInputContent, setHasLoadedInputContent] = useState(false);

    console.log("rerender module", moduleName);

    const debouncedAppendToEditor = useDebouncedCallback(
      useCallback(
        ({ content }) => {
          setEditorContent((editorContent) =>
            editorContent.trim() ? `${editorContent}\n---\n${content}` : content
          );
          scrollDownMax(editorEl);
        },
        [editorEl]
      ),
      50,
      { maxWait: 200 }
    );

    const debouncedAppendToInputEditor = useDebouncedCallback(
      useCallback(
        ({ content }) => {
          setInputEditorContent((inputEditorContent) =>
            inputEditorContent.trim() ? `${inputEditorContent}\n\n${content}` : content
          );
          scrollDownMax(inputEditorEl);
        },
        [inputEditorEl]
      ),
      50,
      { maxWait: 200 }
    );

    // sync extraction with editor content
    useEffect(() => {
      const loadContent = async () => {
        if (extractedWebsiteData$ && isActive) {
          console.log("setting extracted input", moduleName, extractedWebsiteData$);
          debouncedAppendToInputEditor({ content: extractedWebsiteData$ });

          setTimeout(() => {
            extractedWebsiteDataAtom.set("");
          }, 1000);// reset buffer when all editors are done
        } else if (editorArgs && editorArgs.getValue!().length === 0 && !hasLoadedContent) {
          const content = await outputDbState.get();
          if (content) {
            debouncedAppendToEditor({ content });
          } else {
            // set placeholder content
            setEditorContent("");
          }
          setHasLoadedContent(true);
        }
      };
      loadContent();
    }, [editorArgs, hasLoadedContent, extractedWebsiteData$, debouncedAppendToEditor, outputDbState, isActive, moduleName]);

    useEffect(() => {
      const loadInputContent = async () => {
        if (inputEditorArgs && inputEditorArgs.getValue!().length === 0 && !hasLoadedInputContent) {
          const content = await inputDbState.get();
          if (content) {
            debouncedAppendToInputEditor({ content });
          } else {
            // set placeholder content
            setEditorContent("");
          }
          setHasLoadedInputContent(true);
        }
      };
      loadInputContent();
    }, [inputEditorArgs, hasLoadedInputContent, debouncedAppendToInputEditor, inputDbState]);

    const onEditorContentChange = useCallback(
      (markdown: string) => {
        setEditorContent(markdown);
        if (editorArgs) {
          outputDbState.set(markdown);
        }
      },
      [editorArgs, outputDbState]
    );

    const onInputEditorContentChange = useCallback(
      (markdown: string) => {
        setInputEditorContent(markdown);
        if (inputEditorArgs) {
          inputDbState.set(markdown);
        }
      },
      [inputEditorArgs, inputDbState]
    );

    const onEditorCreated = useCallback(({ args }: CallbackArgs) => {
      setEditorEl(args.el);
      setEditorArgs(args);
    }, []);

    const onInputEditorCreated = useCallback(({ args }: CallbackArgs) => {
      setInputEditorEl(args.el);
      setInputEditorArgs(args);
    }, []);

    return (
      <GenericModule
        value={editorContent}
        inputValue={inputEditorContent}
        placeholder={placeholder}
        inputPlaceholder={inputPlaceholder}
        defaultPromptTemplate={prompt}
        name={moduleName}
        editorAtom={editorAtom}
        inputEditorAtom={inputEditorAtom}
        onEditorContentChange={onEditorContentChange}
        onInputEditorContentChange={onInputEditorContentChange}
        onEditorCreated={onEditorCreated}
        onInputEditorCreated={onInputEditorCreated}
        isActive={isActive}
      />
    );
  }
);