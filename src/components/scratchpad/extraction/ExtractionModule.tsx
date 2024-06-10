import { PointerIcon, SendIcon, ShareIcon } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  VerticalResizeHandle,
} from "../../../ui/resizable";
import {
  MarkdownEditor,
  type MilkdownEditorCreatedArgs,
} from "../../MarkdownEditor";
import { AiModelDropdown } from "../../AiModelDropdown";
import { formatCurrencyForDisplay } from "../../../lib/content-script/format";
import {
  calculatePrompt,
  calculateTokensFromBudget,
  generatePrompt,
  type Prompt,
} from "../../../lib/content-script/prompt-template";
import { Button } from "../../../ui/button";
import { useTranslation, Trans } from "react-i18next";
import { useCallback, useEffect, useMemo, useState } from "react";
import { sendPrompt } from "../../../lib/content-script/prompt";
import { useStore } from "@nanostores/react";
import { atom } from "nanostores";
import {
  promptTemplateExtraction,
  type ExtractPromptValues,
} from "../../../data/prompt-templates/extraction";
import { extractedWebsiteDataAtom } from "../../AppModal";
import { useDebouncedCallback } from "use-debounce";
import { autoCorrelateMostRelevantContent } from "../../../lib/content-script/scrape";
import { turndown } from "../../../lib/content-script/turndown";
import { cloneAndFilterNode } from "../../../lib/content-script/dom";

// content cache
const editorAtom = atom<string>("");

export const ExtractionModule = () => {
  const { t, i18n } = useTranslation();
  const extractedWebsiteData$ = useStore(extractedWebsiteDataAtom);

  const [editorContent, setEditorContent] = useState<string>(editorAtom.get());
  const [prompt, setPrompt] = useState<string>(promptTemplateExtraction);

  const [promptPrepared, setPromptPrepared] = useState<Prompt>({
    original: promptTemplateExtraction,
    text: "",
    encoded: [],
    price: 0,
  });

  useEffect(() => {
    const { bestCandidate } = autoCorrelateMostRelevantContent(
      document,
      document.body,
    );

    if (bestCandidate?.node) {
      const markdown = turndown(
        cloneAndFilterNode(bestCandidate.node as HTMLElement),
      );

      console.log("markdown", markdown);

      setEditorContent(markdown);
    } else {
      console.error("No best candidate found");
    }
  }, []);

  // sync editor content with extraction
  const onEditorChange = useCallback((markdown: string) => {
    setEditorContent(markdown);
  }, []);

  const onEditorCreated = useCallback(
    ({ editor }: MilkdownEditorCreatedArgs) => {
      console.log("editor created", editor);
    },
    [],
  );

  const onSharePromptClick = useCallback(() => {
    console.log("share prompt", promptPrepared);
  }, [promptPrepared]);

  const debouncedAppendExtracted = useDebouncedCallback(
    useCallback(
      ({ extractedContent }) => {
        const newState = editorContent.trim()
          ? `${editorContent}\n---\n${extractedContent}`
          : extractedContent;
        setEditorContent(newState);
      },
      [editorContent],
    ),
    100,
    { maxWait: 200 },
  );

  // sync extraction with editor content
  useEffect(() => {
    if (extractedWebsiteData$) {
      // append
      debouncedAppendExtracted({ extractedContent: extractedWebsiteData$ });
    }
  }, [extractedWebsiteData$]);

  // sync prompt with editor content
  const onPromptChange = useCallback((evt: any) => {
    setPrompt(evt.target?.value);
  }, []);

  const debouncedPreparePrompt = useDebouncedCallback(
    useCallback(({ editorContent, prompt }) => {
      requestAnimationFrame(() => {
        setPromptPrepared(
          generatePrompt<ExtractPromptValues>(prompt, {
            MARKDOWN: editorContent,
            DATA_FORMAT: "Markdown",
          }),
        );
      });
    }, []),
    250,
    { maxWait: 500 },
  );

  useEffect(() => {
    debouncedPreparePrompt({ editorContent, prompt });
  }, [editorContent, prompt]);

  useEffect(() => {
    // cache the editor content
    editorAtom.set(editorContent);
  }, [editorContent]);

  const onPromptSendClick = useCallback(() => {
    // actualy send the prompt to the AI

    console.log("send prompt", promptPrepared);

    sendPrompt(
      promptPrepared.text,
      (text: string) => {
        console.log("onChunk", text);
        setEditorContent((prev) => `${prev}${text}`);
      },
      (lastChunkText: string) => {
        console.log("onDone", lastChunkText);

        setEditorContent((prev) => `${prev}${lastChunkText}\n---\n`);
      },
    );
  }, [promptPrepared]);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={65} minSize={20}>
        <div className="ab-w-full ab-h-full ab-overflow-y-auto">
          <MarkdownEditor
            defaultValue={editorContent}
            placeholder={"Extrahierte Inhalte"}
            name="extractionEditor"
            showToolbar={true}
            onChange={onEditorChange}
            onCreated={onEditorCreated}
          />
        </div>
      </ResizablePanel>
      <VerticalResizeHandle withHandle />
      <ResizablePanel defaultSize={35} minSize={20}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30} minSize={10}>
            <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-sticky ab-top-0 ab-z-30 ab-justify-between">
              <h5 className="ab-font-bold ab-text-sm ab-p-1 ab-px-2]">
                Einstellungen
              </h5>
            </div>
            <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
              TODO
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="ml-1 mr-1" />

          <ResizablePanel
            defaultSize={70}
            minSize={60}
            className="ab-h-full ab-flex ab-flex-col ab-w-full"
          >
            <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-justify-between">
              <span className="ab-flex ab-flex-row">
                <h5 className="ab-font-bold ab-p-1 ab-px-2">Smart-Prompt:</h5>
                <AiModelDropdown />
              </span>

              <Button
                size={"sm"}
                className="ab-scale-75 ab-ftr-button ab-mr-0"
                onClick={onSharePromptClick}
              >
                <ShareIcon className="ab-w-4 ab-h-4" />
                <span>Teilen</span>
              </Button>
            </div>
            <textarea
              onChange={onPromptChange}
              name="extractionPromptEditor"
              placeholder="Change the extracted content to re-generate the prompt"
              value={prompt}
              style={{ resize: "none", marginLeft: "5px !important" }}
              className="ab-flex-1 ab-overflow-auto ab-w-full  ab-overscroll-contain"
            />
            <div className="ab-flex ab-ftr-bg ab-flex-row ab-ml-1 ab-mr-0 ab-pr-0 ab-justify-between">
              <h5
                className="ab-font-bold ab-p-1 ab-px-2"
                style={{ fontSize: "0.9rem" }}
              >
                Kosten: {promptPrepared.encoded.length} Token = ~
                {formatCurrencyForDisplay(promptPrepared.price).replace(
                  ".",
                  ",",
                )}
                €; verbleibende Tokens:{" "}
                {formatCurrencyForDisplay(
                  calculateTokensFromBudget(20 /* USD */),
                )}
              </h5>
              <Button
                size={"sm"}
                className="ab-scale-75 ab-ftr-button ab-mr-0"
                onClick={onPromptSendClick}
              >
                <SendIcon className="ab-w-4 ab-h-4" />
                <span>Absenden</span>
              </Button>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
