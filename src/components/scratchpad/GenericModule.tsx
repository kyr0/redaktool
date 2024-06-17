import { SendIcon, ShareIcon } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  VerticalResizeHandle,
} from "../../ui/resizable";
import {
  MarkdownEditor,
  milkdownEditorAtom,
  type MilkdownEditorCreatedArgs,
} from "../MarkdownEditor";
import { AiModelDropdown } from "../AiModelDropdown";
import { formatCurrencyForDisplay } from "../../lib/content-script/format";
import {
  compilePrompt,
  generatePrompt,
  type Prompt,
} from "../../lib/content-script/prompt-template";
import { Button } from "../../ui/button";
import { useTranslation, Trans } from "react-i18next";
import {
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import {
  mapUserLanguageCode,
  sendPrompt,
} from "../../lib/content-script/prompt";
import type { WritableAtom } from "nanostores";
import { useDebouncedCallback } from "use-debounce";
import { Textarea } from "../../ui/textarea";
import type { ModelName } from "../../lib/worker/llm/prompt";
import { Input } from "../../ui/input";
import { copyToClipboard } from "../../lib/content-script/clipboard";
import { toast } from "sonner";
import { useStore } from "@nanostores/react";
import { scrollDownMax } from "../../lib/content-script/dom";

export interface CallbackArgs {
  editorContent: string;
  prompt: string;
  promptPrepared: Prompt;
  setPromptPrepared: (prompt: Prompt) => void;
  setEditorContent: (content: string) => void;
  setPrompt: (prompt: string) => void;
}

export interface GenericModuleProps extends PropsWithChildren {
  name: string;
  promptSettingsWrapperClassName?: string;
  editorAtom: WritableAtom<string>;
  defaultPromptTemplate: string;
  outputTokenScaleFactor: number;
  defaultModelName: ModelName;
  getPromptValues: () => Record<string, string>;
  onCustomInstructionChange: (instruction: string) => void;
  onEditorCreated?: (
    args: CallbackArgs & { args: MilkdownEditorCreatedArgs },
  ) => void;
  onEditorChange?: (args: CallbackArgs) => void;
  onPromptChange?: (args: CallbackArgs) => void;
  onPromptShare?: (args: CallbackArgs) => void;
}

export const GenericModule: React.FC<GenericModuleProps> = ({
  name,
  promptSettingsWrapperClassName,
  editorAtom,
  defaultPromptTemplate,
  outputTokenScaleFactor,
  defaultModelName,
  onEditorCreated,
  onCustomInstructionChange,
  onEditorChange,
  onPromptChange,
  onPromptShare,
  getPromptValues,
  children,
}) => {
  const { t, i18n } = useTranslation();
  const [editorContent, setEditorContent] = useState<string>(editorAtom.get());
  const [prompt, setPrompt] = useState<string>(defaultPromptTemplate);
  const [internalEditorArgs, setInternalEditorArgs] =
    useState<MilkdownEditorCreatedArgs>();
  const [promptPrepared, setPromptPrepared] = useState<Prompt>({
    original: defaultPromptTemplate,
    text: "",
    encoded: [],
    price: 0,
    priceOutput: 0,
    priceInput: 0,
  });

  const [editorEl, setEditorEl] = useState<HTMLElement | null>(null);

  /*
  useEffect(() => {
    if (typeof onEditorCreated === "function") {
      onEditorCreated({
        editorContent,
        prompt,
        setEditorContent,
        setPrompt,
        promptPrepared,
        setPromptPrepared,
      });
    }
  }, [
    editorContent,
    prompt,
    promptPrepared,
    setEditorContent,
    setPrompt,
    setPromptPrepared,
  ]);
  */

  useEffect(() => {
    if (typeof onEditorCreated === "function" && internalEditorArgs) {
      onEditorCreated({
        editorContent,
        prompt,
        setEditorContent,
        setPrompt,
        promptPrepared,
        setPromptPrepared,
        args: internalEditorArgs,
      });
    }
  }, [internalEditorArgs, onEditorCreated]);

  // sync editor content with extraction
  const onEditorChangeInternal = useCallback(
    (markdown: string) => {
      setEditorContent(markdown);
    },
    [setEditorContent],
  );

  const onEditorCreatedInternal = useCallback(
    (args: MilkdownEditorCreatedArgs) => {
      setEditorEl(args.el);
      setInternalEditorArgs(args);
    },
    [setEditorEl, setInternalEditorArgs],
  );

  const onSharePromptClick = useCallback(() => {
    copyToClipboard(`# RedakTool Smart-Prompt [Module: ${name}]

## Sequence 1
      
### Prompt

${promptPrepared.original.replace(/\n/g, "\n")}

---

### Demo values

\`\`\`json
${JSON.stringify(promptPrepared.values, null, 2)}
\`\`\`
`);

    toast("Prompt zum Teilen kopiert!", {
      description:
        "Prompt wurde in die Zwischenablage kopiert und kann jetzt geteilt werden (einfach einfügen).",
      action: {
        label: "Open in GitHub Discussions",
        onClick: () =>
          window.open(
            "https://github.com/kyr0/redaktool/discussions/2",
            "_blank",
          ),
      },
    });
  }, [promptPrepared, name]);

  // sync prompt with editor content
  const onPromptChangeInternal = useCallback(
    (evt: any) => {
      setPrompt(evt.target?.value);
    },
    [setPrompt],
  );

  const debouncedPreparePrompt = useDebouncedCallback(
    useCallback(
      ({ editorContent, prompt }) => {
        requestAnimationFrame(async () => {
          // TODO: implement parser for smartprompt
          console.log(
            "new smartprompt parser",
            await compilePrompt(prompt, getPromptValues()),
          );

          setPromptPrepared(
            generatePrompt<Record<string, string>>(
              prompt,
              {
                USER_LANGUAGE: mapUserLanguageCode(i18n.language),
                CONTENT: editorContent,
                ...getPromptValues(),
              },
              defaultModelName,
              outputTokenScaleFactor,
            ),
          );
        });
      },
      [i18n.language],
    ),
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
    const finalPrompt = generatePrompt<Record<string, string>>(
      prompt,
      {
        // always available
        USER_LANGUAGE: mapUserLanguageCode(i18n.language),
        CONTENT: editorContent,
        ...getPromptValues(),
      },
      defaultModelName,
      outputTokenScaleFactor,
    );

    console.log("send prompt", finalPrompt);

    let isBeginning = true;
    let originalText = "";
    let partialText = "";

    sendPrompt(
      finalPrompt.text,
      (text: string) => {
        //console.log("onChunk", text, "editorEl", editorEl);
        setEditorContent((prev) => {
          if (isBeginning) {
            originalText = prev;
          }

          partialText += text || "";

          return `${prev || ""}${isBeginning ? "\n---\n" : ""}${text || ""}`;
        });

        isBeginning = false;

        scrollDownMax(editorEl);
      },
      (lastChunkText: string) => {
        console.log("onDone", lastChunkText, "editorEl", editorEl);

        // re-flush the editor content (fix possibly broken markdown rendering)
        partialText += lastChunkText || "";

        setEditorContent(`${originalText}\n---\n${partialText || ""}`);

        scrollDownMax(editorEl);
      },
    );
  }, [
    editorContent,
    defaultModelName,
    outputTokenScaleFactor,
    editorEl,
    i18n.language,
  ]);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={65} minSize={20}>
        <div className="ab-w-full ab-h-full ab-overflow-y-auto">
          <MarkdownEditor
            defaultValue={editorContent}
            placeholder={"Extrahierte Inhalte"}
            name={`${name}Editor`}
            showToolbar={true}
            onChange={onEditorChangeInternal}
            onCreated={onEditorCreatedInternal}
          />
        </div>
      </ResizablePanel>
      <VerticalResizeHandle withHandle />
      <ResizablePanel defaultSize={35} minSize={20}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={30}
            minSize={10}
            className="ab-h-full ab-flex ab-flex-col ab-w-full ab-pr-2"
          >
            <div className="ab-ftr-bg ab-flex ab-flex-row ab-justify-between ab-rounded-sm !ab-h-7 ab-items-center">
              <span className="ab-flex ab-flex-row ab-p-1 ab-px-2 ab-text-sm">
                Einstellungen
              </span>
            </div>
            <div
              className={`ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2 ${promptSettingsWrapperClassName}`}
            >
              {children}
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="ml-1 mr-1" />

          <ResizablePanel
            defaultSize={70}
            minSize={60}
            className="ab-h-full ab-flex ab-flex-col ab-w-full ab-pl-2"
          >
            <div className="ab-ftr-bg ab-flex ab-flex-row ab-justify-between ab-rounded-sm !ab-h-7 ab-items-center">
              <span className="ab-flex ab-flex-row ab-items-center">
                <span className="ab-p-1 ab-px-2 ab-text-sm">Smart-Prompt:</span>
                <AiModelDropdown
                  value={defaultModelName}
                  options={[
                    {
                      label: "OpenAI GPT-4o",
                      value: "gpt-4o",
                    },
                    {
                      label: "Anthropic Opus",
                      value: "anthropic-opus",
                    },
                    {
                      label: "Perplexity Sonar",
                      value: "perplexity-sonar",
                    },
                  ]}
                />
              </span>

              <Button
                size={"sm"}
                className="ab-scale-75 ab-ftr-button ab-mr-0 !ab-h-6 hover:!ab-bg-primary-foreground"
                onClick={onSharePromptClick}
              >
                <ShareIcon className="ab-w-4 ab-h-4" />
                <span>Teilen</span>
              </Button>
            </div>
            <textarea
              onChange={onPromptChangeInternal}
              name={`${name}PromptEditor`}
              placeholder="Change the extracted content to re-generate the prompt"
              value={prompt}
              style={{ resize: "none" }}
              className="ab-flex-1 ab-overflow-auto ab-w-full  ab-overscroll-contain ab-ml-1 ab-p-2 ab-outline-none !ab-text-sm"
            />
            <div className="ab-flex ab-flex-col ab-ml-0 ab-mr-0 ab-pr-0 ab-justify-between">
              <span className="ab-flex ab-flex-row ab-justify-between ab-items-end">
                <Input
                  name={`${name}PromptInstructionEditor`}
                  placeholder="Spezialisierungswünsche..."
                  className="!ab-block ab-mb-2 !ab-text-sm ab-h-12 ab-max-h-12"
                  onChange={(evt) =>
                    onCustomInstructionChange(evt.target.value)
                  }
                />
                <Button
                  size={"sm"}
                  className="ab-scale-75 ab-ftr-button ab-mr-0 !ab-h-14 !ab-w-14 !ab-rounded-full hover:!ab-bg-primary-foreground"
                  onClick={onPromptSendClick}
                >
                  <SendIcon className="ab-w-12 ab-h-12" />
                </Button>
              </span>
              <span
                className="ab-p-1 ab-px-2 !ab-text-xs ab-ftr-bg ab-rounded-sm"
                style={{ fontSize: "0.9rem" }}
              >
                Tokens: {promptPrepared.encoded.length} I/O ~
                {promptPrepared.estimatedOutputTokens} ≈{" "}
                {formatCurrencyForDisplay(
                  promptPrepared.price.toFixed(2),
                ).replace(".", ",")}
                {/*
                €; verbleibende Tokens:{" "}
                {formatCurrencyForDisplay(
                  calculateTokensFromBudget(20 ),
                )}
                */}
              </span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
