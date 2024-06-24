import { CogIcon, SendIcon, ShareIcon } from "lucide-react";
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
  finalizePrompt,
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
import type {
  ParseResult,
  ParseSmartPromptResult,
} from "../../lib/worker/prompt";
import { Label } from "../../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { upperCaseFirst } from "../../lib/string-casing";
import { LoadingSpinner } from "../../ui/loading-spinner";

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
  getPromptValues?: () => Record<string, string>;
  onCustomInstructionChange?: (instruction: string) => void;
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
  const [dynamicFields, setDynamicFields] = useState<Array<ParseResult>>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<
    Record<string, string>
  >({});
  const [recompilingInProgress, setRecompilingInProgress] =
    useState<boolean>(false);

  const [streamingInProgress, setStreamingInProgress] =
    useState<boolean>(false);

  const [customInstruction, setCustomInstruction] = useState<string>("");

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
    console.log("onSharePromptClick");
    copyToClipboard(`# RedakTool Smart-Prompt [Module: ${name}]
      
### Prompt

\`\`\`liquid
{% # Beispielwerte: %}
${Object.keys(promptPrepared.values || {})
  .map((key) =>
    promptPrepared.values?.[key]
      ? `{% assign ${key} = ${
          typeof promptPrepared.values?.[key] === "string"
            ? `"${promptPrepared.values?.[key]}"`
            : promptPrepared.values?.[key]
        } %}`
      : "",
  )
  .join("\n")}

${promptPrepared.original.replace(/\n/g, "\n")}
\`\`\``);

    console.log("promptPrepared", promptPrepared);
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

  const getValidatedDynamicFieldValues = useCallback(
    (secondPassDynamicFields?: ParseResult[]) => {
      const fields = secondPassDynamicFields || dynamicFields;
      let fieldValues = Object.assign({}, dynamicFieldValues);
      for (const field of fields) {
        // set default values for dynamic fields
        if (typeof dynamicFieldValues[field.key] === "undefined") {
          fieldValues = {
            ...fieldValues,
            [field.key]: fields.find((f) => f.key === field.key)?.default || "",
          };
        }
      }
      return fieldValues;
    },
    [dynamicFieldValues, dynamicFields],
  );

  const compilePromptAndSyncFields = useCallback(
    (prompt: string, values: Record<string, any> = {}) =>
      new Promise<{
        resolvedValues: Record<string, string>;
        parsedPrompt: ParseSmartPromptResult;
        dynamicFields: ParseResult[];
      }>((resolve, reject) => {
        (async () => {
          try {
            // first pass compiler for dynamic fields
            let parsedPrompt = await compilePrompt(
              prompt,
              getValidatedDynamicFieldValues(),
            );
            console.log("new smartprompt parser", parsedPrompt);

            const dynamicFields = Object.keys(parsedPrompt.meta)
              .map((key) => parsedPrompt.meta[key])
              .sort((a, b) => a.order - b.order);

            console.log("dynamicFields", dynamicFields);

            // trigger dynamic field re-rendering
            setDynamicFields(dynamicFields);

            // second pass value evaluation
            const secondPassDynamicFieldValues =
              getValidatedDynamicFieldValues(dynamicFields);

            const finalizedValues = {
              ...secondPassDynamicFieldValues,
              ...values,
            };

            // second pass compiler for dynamic fields
            parsedPrompt = await compilePrompt(prompt, finalizedValues);

            resolve({
              resolvedValues: finalizedValues,
              parsedPrompt,
              dynamicFields,
            });
          } catch (e) {
            reject(e);
          }
        })();
      }),
    [
      dynamicFieldValues,
      setDynamicFieldValues,
      getValidatedDynamicFieldValues,
      compilePrompt,
    ],
  );

  const generatePrompt = useCallback(
    ({ prompt, editorContent, customInstruction, modelName }: any) => {
      return new Promise<Prompt>((resolve, reject) => {
        setRecompilingInProgress(true);
        (async () => {
          try {
            // second pass value evaluation
            const compiledPrompt = await compilePromptAndSyncFields(prompt, {
              USER_LANGUAGE: mapUserLanguageCode(i18n.language),
              CONTENT: editorContent,
              CUSTOM_INSTRUCTION: customInstruction || undefined,
            });

            console.log("compiledPrompt", compiledPrompt);

            const finalPrompt = finalizePrompt(
              prompt,
              compiledPrompt.parsedPrompt.prompt,
              compiledPrompt.resolvedValues,
              modelName,
              compiledPrompt.parsedPrompt.outputValues.OUTPUT_TOKEN_FACTOR
                ? Number(
                    compiledPrompt.parsedPrompt.outputValues
                      .OUTPUT_TOKEN_FACTOR,
                  )
                : outputTokenScaleFactor,
            );
            console.log("finalPrompt", finalPrompt);

            resolve(finalPrompt);
          } catch (e) {
            reject(e);
          }

          setRecompilingInProgress(false);
        })();
      });
    },
    [
      setRecompilingInProgress,
      compilePromptAndSyncFields,
      finalizePrompt,
      mapUserLanguageCode,
      i18n,
      outputTokenScaleFactor,
    ],
  );

  const debouncedPreparePrompt = useDebouncedCallback(
    useCallback(
      ({ editorContent, prompt, customInstruction }) => {
        requestAnimationFrame(async () => {
          console.log("dynamicFieldValues");
          setPromptPrepared(
            await generatePrompt({
              prompt,
              editorContent,
              customInstruction,
              modelName: defaultModelName,
            }),
          );
        });
      },
      [
        i18n.language,
        dynamicFieldValues,
        setDynamicFieldValues,
        customInstruction,
        generatePrompt,
      ],
    ),
    250,
    { maxWait: 500 },
  );

  useEffect(() => {
    debouncedPreparePrompt({ editorContent, prompt, customInstruction });
  }, [editorContent, prompt, customInstruction]);

  useEffect(() => {
    // cache the editor content
    editorAtom.set(editorContent);
  }, [editorContent]);

  const onPromptSendClick = useCallback(() => {
    (async () => {
      let isBeginning = true;
      let originalText = "";
      let partialText = "";

      const finalPrompt = await generatePrompt({
        prompt,
        editorContent,
        customInstruction,
        modelName: defaultModelName,
      });

      setStreamingInProgress(true);

      try {
        sendPrompt(
          finalPrompt.text,
          (text: string) => {
            //console.log("onChunk", text, "editorEl", editorEl);
            setEditorContent((prev) => {
              if (isBeginning) {
                originalText = prev;
              }

              partialText += text || "";

              return `${prev || ""}${isBeginning ? "\n---\n" : ""}${
                text || ""
              }`;
            });

            isBeginning = false;

            scrollDownMax(editorEl);
          },
          (lastChunkText: string) => {
            try {
              console.log("onDone", lastChunkText, "editorEl", editorEl);

              // re-flush the editor content (fix possibly broken markdown rendering)
              partialText += lastChunkText || "";

              requestAnimationFrame(() => {
                setEditorContent(`${originalText}\n---\n${partialText || ""}`);

                scrollDownMax(editorEl);
              });
            } finally {
              setStreamingInProgress(false);
            }
          },
        );
      } catch (e) {
        setStreamingInProgress(false);
        // TODO: show toast (error mode)
        console.error("sendPrompt error", e);
      }
    })();
  }, [
    generatePrompt,
    setStreamingInProgress,
    customInstruction,
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
              className={`ab-flex ab-h-full ab-items-center ab-justify-start ab-flex-col ab-p-2 ab-overflow-y-auto ${
                promptSettingsWrapperClassName || ""
              }`}
            >
              {!recompilingInProgress &&
                dynamicFields.length === 0 &&
                promptPrepared.text === "" && (
                  <Label className="ab-mb-2 ab-flex  ab-text-sm">
                    <CogIcon className="ab-w-4 ab-h-4 ab-mr-2" />
                    Smart-Prompt wird kompiliert...
                  </Label>
                )}

              {!recompilingInProgress &&
                dynamicFields.length === 0 &&
                promptPrepared.text !== "" && (
                  <Label className="ab-mb-2 ab-flex">
                    Keine Einstellungen verfügbar
                  </Label>
                )}

              {dynamicFields.map((field) => (
                <div key={field.key} className="ab-mb-2 ab-w-full">
                  <Label className="ab-mb-2 ab-flex">{field.label}</Label>

                  {(field.type === "text" || field.type === "number") && (
                    <Input
                      type={field.type || "text"}
                      name={`${name}${field.key}Input`}
                      placeholder={field.label}
                      value={dynamicFieldValues[field.key] || field.default}
                      className="!ab-block !ab-text-sm"
                      onChange={(evt) => {
                        console.log(
                          "field change",
                          field.key,
                          evt.target.value,
                        );
                        setDynamicFieldValues((prev) => ({
                          ...prev,
                          [field.key]: evt.target.value,
                        }));
                      }}
                    />
                  )}

                  {field.type === "textarea" && (
                    <Textarea
                      name={`${name}${field.key}Input`}
                      placeholder={field.label}
                      value={dynamicFieldValues[field.key] || field.default}
                      className="!ab-block !ab-text-sm"
                      onChange={(evt) => {
                        console.log(
                          "field change",
                          field.key,
                          evt.target.value,
                        );
                        setDynamicFieldValues((prev) => ({
                          ...prev,
                          [field.key]: evt.target.value,
                        }));
                      }}
                    />
                  )}

                  {field.type === "select" && (
                    <Select
                      onValueChange={(value) => {
                        console.log("onValueChange", value);
                        setDynamicFieldValues((prev) => ({
                          ...prev,
                          [field.key]: value,
                        }));
                      }}
                      defaultValue={
                        dynamicFieldValues[field.key] || field.default
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={field.label} />
                      </SelectTrigger>
                      <SelectContent className="ab-z-[2147483646]">
                        {(field.options || []).map((option) => (
                          <SelectItem
                            key={option + Math.random()}
                            value={option}
                          >
                            {upperCaseFirst(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              {/* children */}
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
                  value={customInstruction}
                  name={`${name}PromptInstructionEditor`}
                  placeholder="Spezialisierungswünsche..."
                  className="!ab-block ab-mb-2 !ab-text-sm ab-h-12 ab-max-h-12"
                  onChange={(evt) => setCustomInstruction(evt.target.value)}
                />
                <Button
                  size={"sm"}
                  disabled={
                    recompilingInProgress ||
                    streamingInProgress ||
                    promptPrepared.text === ""
                  }
                  className="ab-scale-75 ab-ftr-button ab-mr-0 !ab-h-14 !ab-w-14 !ab-rounded-full hover:!ab-bg-primary-foreground"
                  onClick={onPromptSendClick}
                >
                  <SendIcon className="ab-w-12 ab-h-12" />
                </Button>
              </span>
              <span className="ab-p-1 ab-px-2 !ab-text-xs ab-ftr-bg ab-rounded-sm ab-justify-between ab-flex ab-flex-row">
                <span style={{ fontSize: "0.7rem" }}>
                  Tokens: {promptPrepared.encoded.length} I/O ~
                  {promptPrepared.estimatedOutputTokens} ≈{" "}
                  {formatCurrencyForDisplay(
                    promptPrepared.price.toFixed(2),
                  ).replace(".", ",")}
                </span>
                {/*
                €; verbleibende Tokens:{" "}
                {formatCurrencyForDisplay(
                  calculateTokensFromBudget(20 ),
                )}
                */}

                {(recompilingInProgress || streamingInProgress) && (
                  <Label style={{ fontSize: "0.7rem" }} className="ab-flex">
                    <LoadingSpinner className="ab-w-3 ab-h-3 ab-ml-1" />
                  </Label>
                )}
              </span>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
