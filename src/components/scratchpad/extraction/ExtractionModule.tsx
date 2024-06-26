import { atom } from "nanostores";
import { GenericModule, type CallbackArgs } from "../GenericModule";
// @ts-ignore
import extractionPrompt from "../../../data/prompt-templates/extraction.liquid";
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

const editorAtom = atom<string>("");
const autoExtractAtom = atom<string>("");

export const ExtractionModule = () => {
  const extractedWebsiteData$ = useStore(extractedWebsiteDataAtom);
  const [editorContent, setEditorContent] = useState<string>(editorAtom.get());
  const [editorEl, setEditorEl] = useState<HTMLElement | null>(null);

  // auto-extract content
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

  const debouncedAppendExtracted = useDebouncedCallback(
    useCallback(
      ({ extractedContent }) => {
        const newState = editorContent.trim()
          ? `${editorContent}\n---\n${extractedContent}`
          : extractedContent;

        setEditorContent(newState);

        scrollDownMax(editorEl);
      },
      [editorContent, setEditorContent, editorEl],
    ),
    100,
    { maxWait: 200 },
  );

  // sync extraction with editor content
  useEffect(() => {
    if (extractedWebsiteData$) {
      debouncedAppendExtracted({ extractedContent: extractedWebsiteData$ });
      extractedWebsiteDataAtom.set("");
    }
  }, [extractedWebsiteData$]);

  const onEditorContentChange = useCallback(
    (markdown: string) => {
      setEditorContent(markdown);
    },
    [setEditorContent],
  );

  const onEditorCreated = useCallback(
    ({ args }: CallbackArgs) => {
      setEditorEl(args.el);
    },
    [setEditorEl],
  );

  return (
    <GenericModule
      value={editorContent}
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={extractionPrompt}
      name="extraction"
      editorAtom={editorAtom}
      outputTokenScaleFactor={1.2}
      onEditorContentChange={onEditorContentChange}
      onEditorCreated={onEditorCreated}
    />
  );
};
