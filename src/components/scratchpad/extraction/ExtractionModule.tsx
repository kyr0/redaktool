import { atom } from "nanostores";
import { GenericModule, type CallbackArgs } from "../GenericModule";
// @ts-ignore
import extractionPrompt from "../../../data/prompt-templates/extraction.liquid?raw";
import { extractedWebsiteDataAtom } from "../../AppModal";
import { useStore } from "@nanostores/react";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { autoCorrelateMostRelevantContent } from "../../../lib/content-script/scrape";
import {
  cloneAndFilterNode,
  scrollDownMax,
} from "../../../lib/content-script/dom";
import { turndown } from "../../../lib/content-script/turndown";
import type { MilkdownEditorCreatedArgs } from "../../MarkdownEditor";
import { db } from "../../../lib/content-script/db";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");
const autoExtractAtom = atom<string>("");
const moduleName = "extraction";
const placeholder =
  "Der analysierte Text wird nach der KI-Verarbeitung hier angezeigt. Fügen Sie dazu eine Text-Eingabe ein und klicken Sie auf den Senden-Button.";
const inputPlaceholder = `
  Bei der **KI-Analyse** wird der Text, den Sie hier einfügen auf relevante Aspekte hin untersucht und aufgegliedert. 
  Dabei wird der Text für die Zielgruppe verständlicher und prägnanter formuliert. 
  Dieses Werkzeug spart Ihnen Zeit, weil es mühsames Querlesen auf ein Minimum reduziert. 
  Auf der linken Seite finden Sie alle Einstellungen, um die Arbeitsweise der Analyse zu steuern.
`;
const outputDbState = db(`${moduleName}-output`);
const inputDbState = db(`${moduleName}-input`);

export const ExtractionModule = () => {
  const extractedWebsiteData$ = useStore(extractedWebsiteDataAtom);
  const [editorContent, setEditorContent] = useState<string>(editorAtom.get());
  const [inputEditorContent, setInputEditorContent] = useState<string>(
    inputEditorAtom.get(),
  );
  const [editorEl, setEditorEl] = useState<HTMLElement | null>(null);
  const [inputEditorEl, setInputEditorEl] = useState<HTMLElement | null>(null);
  const [editorArgs, setEditorArgs] = useState<MilkdownEditorCreatedArgs>();
  const [inputEditorArgs, setInputEditorArgs] =
    useState<MilkdownEditorCreatedArgs>();

  // auto-extract content
  /*
  useEffect(() => {
    console.log("auto-extract existing!!", autoExtractAtom.get());

    const extractedWebsiteData = autoExtractAtom.get();

    // only if no content is present
    if (extractedWebsiteData?.length && extractedWebsiteData.length > 0) {
      return;
    }

    const { bestCandidate } = autoCorrelateMostRelevantContent(
      document,
      document.body,
    );

    if (bestCandidate?.node) {
      const markdown = turndown(
        cloneAndFilterNode(bestCandidate.node as HTMLElement),
      );

      console.log("markdown", markdown);

      autoExtractAtom.set(markdown);

      setEditorContent(markdown);
    } else {
      console.error("No best candidate found");
    }
  }, []);
  */

  const debouncedAppendToEditor = useDebouncedCallback(
    useCallback(
      ({ content }) => {
        console.log(
          "debouncedAppendToEditor",
          content,
          "editorContent",
          editorContent,
          "placeholder",
          placeholder,
        );
        // if the editor has only placeholder content or is empty, replace it

        if (editorContent === placeholder || editorContent === "") {
          console.log("Add WITHOUT ---");
          setEditorContent(content);
        } else {
          const newState = editorContent.trim()
            ? `${editorContent}\n---\n${content}`
            : content;

          setEditorContent(newState);
        }
        scrollDownMax(editorEl);
      },
      [editorContent, setEditorContent, editorEl],
    ),
    100,
    { maxWait: 200 },
  );

  const debouncedAppendToInputEditor = useDebouncedCallback(
    useCallback(
      ({ content }) => {
        console.log("debouncedAppendToInputEditor", content);
        const newState = inputEditorContent.trim()
          ? `${inputEditorContent}\n\n${content}`
          : content;

        setInputEditorContent(newState);

        console.log("debouncedAppendToInputEditor", content);

        scrollDownMax(inputEditorEl);
      },
      [inputEditorContent, setInputEditorContent, inputEditorEl],
    ),
    100,
    { maxWait: 200 },
  );

  // sync extraction with editor content
  useEffect(() => {
    if (extractedWebsiteData$) {
      console.log("setting extracted input", extractedWebsiteData$);
      debouncedAppendToInputEditor({ content: extractedWebsiteData$ });
      extractedWebsiteDataAtom.set(""); // reset buffer
    } else if (editorArgs && editorArgs.getValue!().length === 0) {
      (async () => {
        const content = await outputDbState.get();
        if (content) {
          debouncedAppendToEditor({ content });
        } else {
          debouncedAppendToEditor({ content: placeholder });
        }
      })();
    }
  }, [extractedWebsiteData$, editorArgs]);

  useEffect(() => {
    if (inputEditorArgs && inputEditorArgs.getValue!().length === 0) {
      (async () => {
        const content = await inputDbState.get();
        if (content) {
          debouncedAppendToInputEditor({ content });
        } else {
          debouncedAppendToInputEditor({ content: inputPlaceholder });
        }
      })();
    }
  }, [inputEditorArgs]);

  const onEditorContentChange = useCallback(
    (markdown: string) => {
      setEditorContent(markdown);
      if (editorArgs) {
        outputDbState.set(markdown);
      }
    },
    [setEditorContent, editorArgs],
  );

  const onInputEditorContentChange = useCallback(
    (markdown: string) => {
      setInputEditorContent(markdown);
      if (inputEditorArgs) {
        inputDbState.set(markdown);
      }
    },
    [setInputEditorContent, inputEditorArgs],
  );

  const onEditorCreated = useCallback(
    ({ args }: CallbackArgs) => {
      setEditorEl(args.el);
      setEditorArgs(args);
    },
    [setEditorEl],
  );

  const onInputEditorCreated = useCallback(
    ({ args }: CallbackArgs) => {
      setInputEditorEl(args.el);
      setInputEditorArgs(args);
    },
    [setInputEditorEl],
  );

  return (
    <GenericModule
      value={editorContent}
      inputValue={inputEditorContent}
      placeholder={placeholder}
      inputPlaceholder={inputPlaceholder}
      defaultModelName="openai-gpt-4o-mini"
      defaultPromptTemplate={extractionPrompt}
      name={moduleName}
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      outputTokenScaleFactor={1.2}
      onEditorContentChange={onEditorContentChange}
      onInputEditorContentChange={onInputEditorContentChange}
      onEditorCreated={onEditorCreated}
      onInputEditorCreated={onInputEditorCreated}
    />
  );
};
