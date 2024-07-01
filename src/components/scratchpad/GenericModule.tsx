import {
  ArrowDown,
  BombIcon,
  BookIcon,
  CogIcon,
  InfoIcon,
  MessageCircleWarning,
  SendIcon,
  ShareIcon,
} from "lucide-react";
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
import {
  guardedSelectionGuaranteedAtom,
  selectionGuaranteedAtom,
} from "../../lib/content-script/stores/use-selection";
import {
  kmpSearchMarkdown,
  sliceOutMarkdownTextIntersection,
  turndown,
} from "../../lib/content-script/turndown";
import llmModels from "../../data/llm-models/index";
import { uuid } from "../../lib/content-script/uuid";
import {
  QuestionMarkCircledIcon,
  QuestionMarkIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import type { PromptTokenUsage } from "../../lib/worker/llm/prompt";
import { Slider } from "../../ui/slider";
import { Toggle } from "../../ui/toggle";
import { Switch } from "../../ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../ui/tooltip";
import { MiniInfoButton } from "../MiniInfoButton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { cn } from "../../lib/content-script/utils";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";

export interface CallbackArgs {
  editorContent: string;
  prompt: string;
  promptPrepared: Prompt;
  setPromptPrepared: (prompt: Prompt) => void;
  setEditorContent: (content: string) => void;
  setPrompt: (prompt: string) => void;
  args: MilkdownEditorCreatedArgs;
}

export interface GenericModuleProps extends PropsWithChildren {
  value?: string;
  name: string;
  placeholder?: string;
  promptSettingsWrapperClassName?: string;
  editorAtom: WritableAtom<string>;
  defaultPromptTemplate: string;
  outputTokenScaleFactor: number;
  defaultModelName: string;
  getPromptValues?: () => Record<string, string>;
  onCustomInstructionChange?: (instruction: string) => void;
  onEditorCreated?: (
    args: CallbackArgs & { args: MilkdownEditorCreatedArgs },
  ) => void;
  onEditorContentChange?: (markdown: string) => void;
  onPromptChange?: (args: CallbackArgs) => void;
  onPromptShare?: (args: CallbackArgs) => void;
}

export const GenericModule: React.FC<GenericModuleProps> = ({
  value,
  name,
  promptSettingsWrapperClassName,
  placeholder,
  editorAtom,
  defaultPromptTemplate,
  outputTokenScaleFactor,
  defaultModelName,
  onEditorCreated,
  onCustomInstructionChange,
  onEditorContentChange,
  onPromptChange,
  onPromptShare,
  getPromptValues,
  children,
}) => {
  const { t, i18n } = useTranslation();
  const [editorContent, setEditorContent] = useState<string>(editorAtom.get());
  const [prompt, setPrompt] = useState<string>(defaultPromptTemplate);
  const [stopStreamCallback, setStopStreamCallback] = useState<{
    stopStream: Function;
  }>();
  const [modelPk, setModelPk] = useState<string>(defaultModelName);
  const [internalEditorArgs, setInternalEditorArgs] =
    useState<MilkdownEditorCreatedArgs>();
  const [promptPrepared, setPromptPrepared] = useState<Prompt>({
    id: uuid(),
    original: defaultPromptTemplate,
    text: "",
    model: defaultModelName,
    estimatedInputTokens: 0,
    price: 0,
    priceOutput: 0,
    priceInput: 0,
  });
  const textSelection$ = useStore(guardedSelectionGuaranteedAtom);
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
  const [promptContent, setPromptContent] = useState<string>("");
  const [lastActualUsage, setLastActualUsage] = useState<PromptTokenUsage>();
  const [lastTotalPrice, setLastTotalPrice] = useState<number>();
  const [activeTab, setActiveTab] = useState<"settings" | "promptEditor">(
    "settings",
  );

  // auto-tune parameters
  const [autoTuneCreativity, setAutoTuneCreativity] = useState<number>(70);
  const [autoTuneFocusActivated, setAutoTuneFocusActivated] =
    useState<boolean>(false);
  const [autoTuneFocus, setAutoTuneFocus] = useState<number>(0);
  const [autoTuneGlossaryActivated, setAutoTuneGlossaryActivated] =
    useState<boolean>(false);
  const [autoTuneGlossary, setAutoTuneGlossary] = useState<number>(100);

  useEffect(() => {
    setPromptContent(editorContent);
    if (textSelection$?.element) {
      const selectedMd = turndown(textSelection$.element.innerHTML);

      console.log(
        "selected text",
        textSelection$.text,
        "MD len",
        selectedMd.length,
      );

      /*
      const slicedContent = sliceOutMarkdownTextIntersection(
        selectedMd,
        textSelection$.text,
      );
      */

      console.log("selectedMd", selectedMd);

      let slicedContent = textSelection$.text;

      const sliceIndexes = kmpSearchMarkdown(selectedMd, textSelection$.text);

      if (sliceIndexes[0] !== -1 && sliceIndexes[1] !== -1) {
        slicedContent = selectedMd.substring(sliceIndexes[0], sliceIndexes[1]);
      }

      console.log("slicedContent", slicedContent);

      if (slicedContent) {
        console.log("using selected text!", slicedContent);
        // use selected text instead of whole editor content
        setPromptContent(slicedContent);

        //if (!selectionGuaranteedAtom.get()) {
        // reset selection
        guardedSelectionGuaranteedAtom.set(null);
        //}
      }
    }
  }, [textSelection$, textSelection$?.element, editorContent]);

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
            //reject(e);
            toast.error("Fehler beim Kompilieren des Smart-Prompt", {
              icon: (
                <MessageCircleWarning className="ab-shrink-0 !ab-w-8 !ab-h-8" />
              ),
              description: (e as Error).message,
            });
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
            /*
            // TODO: use a new state: promptContent and useEffect to sync
            if (textSelection$?.element) {
              const selectedMd = turndown(textSelection$.element.innerHTML);
              const slicedContent = sliceOutMarkdownTextIntersection(
                selectedMd,
                textSelection$.text,
              );
              console.log("using selected text!", slicedContent);

              // use selected text instead of whole editor content
              editorContent = slicedContent;

              if (!selectionGuaranteedAtom.get()) {
                // reset selection
                guardedSelectionGuaranteedAtom.set(null);
              }
            }
            */

            // second pass value evaluation
            const compiledPrompt = await compilePromptAndSyncFields(prompt, {
              USER_LANGUAGE: mapUserLanguageCode(i18n.language),
              CONTENT: editorContent,
              MODEL_NAME: modelName,
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
      textSelection$,
    ],
  );

  const debouncedPreparePrompt = useDebouncedCallback(
    useCallback(
      ({ promptContent, prompt, customInstruction, modelPk }) => {
        requestAnimationFrame(async () => {
          setPromptPrepared(
            await generatePrompt({
              prompt,
              editorContent: promptContent || editorContent,
              customInstruction,
              modelName: modelPk,
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
        editorContent,
      ],
    ),
    250,
    //{ maxWait: 500 },
  );

  useEffect(() => {
    debouncedPreparePrompt({
      promptContent,
      prompt,
      customInstruction,
      modelPk,
    });
  }, [promptContent, prompt, customInstruction, modelPk]);

  // sync
  useEffect(() => {
    // cache the editor content
    editorAtom.set(editorContent);

    if (typeof onEditorContentChange === "function") {
      onEditorContentChange(editorContent);
    }
  }, [editorContent]);

  // back-sync
  useEffect(() => {
    setEditorContent(value || "");
  }, [value]);

  const onPromptSendClick = useCallback(() => {
    (async () => {
      let isBeginning = true;
      let originalText = "";
      let partialText = "";

      const finalPrompt = await generatePrompt({
        prompt,
        editorContent: promptContent || editorContent,
        customInstruction,
        modelName: modelPk,
      });

      setStreamingInProgress(true);

      const reflush = () => {
        setTimeout(() => {
          requestAnimationFrame(() => {
            setEditorContent(`${originalText}\n---\n${partialText || ""}`);

            scrollDownMax(editorEl);

            setStreamingInProgress(false);
          });
        }, 1);
      };

      try {
        const stopStreamCb = sendPrompt(
          finalPrompt,
          (text: string) => {
            console.log("onChunk", text, "editorEl", editorEl);
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
          (
            completeText: string,
            usage: PromptTokenUsage,
            totalPrice: number,
          ) => {
            console.log(
              "onDone",
              completeText,
              "editorEl",
              editorEl,
              "usage",
              usage,
            );

            setLastActualUsage(usage);
            setLastTotalPrice(totalPrice);

            partialText = completeText;

            reflush();
          },
          (error: string) => {
            console.error("onError", error);
            setStreamingInProgress(false);
            toast.error("Fehler beim Ausführen des Prompts", {
              icon: (
                <MessageCircleWarning className="ab-shrink-0 !ab-w-16 ab-pr-1" />
              ),
              description: error,
            });
          },
        );

        setStopStreamCallback({
          stopStream: () => {
            stopStreamCb.stopStream();
            reflush();
          },
        });
      } catch (e) {
        setStreamingInProgress(false);
        toast.error("Fehler beim Ausführen des Prompts", {
          icon: (
            <MessageCircleWarning className="ab-shrink-0 !ab-w-16 ab-pr-1" />
          ),
          description: (e as Error).message,
        });
      }
    })();
  }, [
    generatePrompt,
    setStreamingInProgress,
    customInstruction,
    promptContent,
    editorContent,
    outputTokenScaleFactor,
    editorEl,
    modelPk,
    i18n.language,
  ]);

  const onStopPromptStreamingClick = useCallback(() => {
    if (stopStreamCallback) {
      console.log("onStopPromptStreamingClick");
      stopStreamCallback.stopStream();
    }
  }, [stopStreamCallback, setStreamingInProgress]);

  const onHelpClick = useCallback(() => {
    window.open("https://github.com/kyr0/redaktool/wiki", "_blank");
  }, []);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={65} minSize={20}>
        <div className="ab-w-full ab-h-full ab-overflow-y-auto">
          <MarkdownEditor
            defaultValue={editorContent}
            placeholder={placeholder}
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
            className="ab-h-full ab-flex ab-flex-col ab-w-full ab-pr-2 ab-overflow-y-auto"
          >
            <div className="ab-ftr-bg ab-flex ab-flex-row ab-justify-between ab-rounded-sm !ab-h-7 ab-items-center ab-mb-2">
              <span className="ab-flex ab-flex-row ab-items-center">
                <span className="ab-p-1 ab-px-2 ab-text-sm">Modell:</span>
              </span>

              <span className="ab-mr-1">
                <AiModelDropdown
                  value={modelPk}
                  onChange={(value) => {
                    setModelPk(value);
                  }}
                  options={llmModels.map((m) => ({
                    label: m.label
                      .replace(new RegExp(m.provider, "gi"), "")
                      .trim(),
                    value: m.pk,
                  }))}
                />
              </span>
            </div>

            <div className="ab-flex ab-flex-col ab-w-full ab-h-full ab-overflow-auto">
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-justify-between ab-rounded-sm !ab-h-7 ab-items-center ab-mb-2">
                <span className="ab-flex ab-flex-row ab-p-1 ab-px-2 ab-text-sm">
                  Parameter
                </span>
                <span className="ab-mr-1">
                  <Button
                    size={"sm"}
                    className="ab-scale-75 ab-ftr-button !ab-h-6 hover:!ab-bg-primary-foreground ab-origin-right"
                    onClick={onHelpClick}
                  >
                    <QuestionMarkCircledIcon className="ab-w-4 ab-h-4 ab-mr-1" />
                    <span>Hilfe</span>
                  </Button>
                </span>
              </div>
              <div
                className={`ab-flex ab-h-full ab-items-center ab-justify-start ab-flex-col ab-p-2 ab-overflow-y-auto ${
                  promptSettingsWrapperClassName || ""
                }`}
              >
                <div key={"autoTuneCreativity"} className="ab-mb-2 ab-w-full">
                  <div className="ab-flex ab-mb-1 ab-justify-between ab-items-center">
                    <Label className="ab-mb-2 ab-flex">Kreativität</Label>

                    <MiniInfoButton>
                      Beeinflusst das Vorkommen neuer Assoziationen, Wörter,
                      Strukturen sowie die Abweichung vom definierten Stil.
                    </MiniInfoButton>
                  </div>
                  <Slider
                    max={100}
                    step={1}
                    value={[autoTuneCreativity]}
                    onChange={(value) => setAutoTuneCreativity(value[0])}
                  />
                </div>

                <div key={"autoTuneFocus"} className="ab-mb-2 ab-w-full">
                  <div className="ab-flex ab-mb-1 ab-justify-between ab-items-center">
                    <div className="ab-flex">
                      <Input
                        id="autoTuneFocus"
                        type="checkbox"
                        className="!ab-w-4 ab-h-4 !ab-mr-1"
                      />
                      <Label htmlFor="autoTuneFocus">Fokus erhöhen</Label>
                    </div>
                    <MiniInfoButton>
                      Ein höherer Fokus limitiert die Anzahl der Themen und die
                      Diversität der Assoziationen über den gesamten Text
                      hinweg. Das kann hilfreich sein, wenn von einem
                      spezifischen Thema und einem Konsens weniger abgewichen
                      werden soll.
                    </MiniInfoButton>
                  </div>
                  <Slider
                    max={100}
                    step={1}
                    value={[autoTuneCreativity]}
                    onChange={(value) => setAutoTuneCreativity(value[0])}
                  />
                </div>

                <div key={"autoTuneGlossary"} className="ab-mb-2 ab-w-full">
                  <div className="ab-flex ab-mb-1 ab-justify-between ab-items-center">
                    <div className="ab-flex ab-mb-1">
                      <Input
                        id="autoTuneGlossary"
                        type="checkbox"
                        className="!ab-w-4 ab-h-4 !ab-mr-1"
                      />
                      <Label htmlFor="autoTuneGlossary">
                        Wortvielfalt verringern
                      </Label>
                    </div>
                    <MiniInfoButton>
                      Limitiert die Anzahl unterschiedlicher Wörter und
                      verringert somit den lexikalischen Reichtum. Das kann bei
                      Übersetzungen und Fachtexten hilfreich sein, wenn es auf
                      eine spezifische Terminologie ankommt.
                    </MiniInfoButton>
                  </div>
                  <Slider
                    max={100}
                    step={1}
                    value={[autoTuneCreativity]}
                    onChange={(value) => setAutoTuneCreativity(value[0])}
                  />
                </div>
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="ml-1 mr-1" />

          <ResizablePanel
            defaultSize={70}
            minSize={60}
            className="ab-h-full ab-flex ab-flex-col ab-w-full ab-pl-2"
          >
            <div className="ab-flex ab-w-full ab-h-full  ab-overflow-auto">
              <Tabs
                defaultValue={activeTab}
                className="ab-w-full ab-flex ab-flex-col ab-h-full ab-overflow-auto"
              >
                <div className="ab-flex ab-justify-between">
                  <TabsList className="!ab-p-0 !ab-m-0  !ab-min-h-8 !ab-h-8">
                    <TabsTrigger
                      className={cn(
                        "ab-text-sm",
                        activeTab === "settings"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item ab-bg-secondary",
                      )}
                      value="settings"
                      onClick={() => setActiveTab("settings")}
                    >
                      Einstellungen
                    </TabsTrigger>
                    <TabsTrigger
                      className={cn(
                        "ab-text-sm !ab-ml-2",
                        activeTab === "promptEditor"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item ab-bg-secondary",
                      )}
                      value="promptEditor"
                      onClick={() => setActiveTab("promptEditor")}
                    >
                      Smart-Prompt
                    </TabsTrigger>
                  </TabsList>
                  {activeTab === "promptEditor" && (
                    <Button
                      size={"sm"}
                      className=" ab-ftr-button  ab-bg-secondary  !ab-h-6 hover:ab-ftr-bg-halfcontrast ab-origin-right"
                      onClick={onSharePromptClick}
                    >
                      <ShareIcon className="ab-w-4 ab-h-4 ab-mr-1" />
                      <span>Teilen</span>
                    </Button>
                  )}
                </div>
                <TabsContent
                  value="settings"
                  className="ab-flex-1 ab-h-full ab-overflow-y-scroll "
                >
                  <div className="ab-grid ab-grid-cols-2 ab-gap-4 ">
                    {!recompilingInProgress &&
                      dynamicFields.length === 0 &&
                      promptPrepared.text === "" && (
                        <Label className="ab-mb-2 ab-flex ab-text-sm">
                          <CogIcon className="ab-w-4 ab-h-4 ab-mr-2" />
                          Smart-Prompt wird kompiliert...
                        </Label>
                      )}

                    {!recompilingInProgress &&
                      dynamicFields.length === 0 &&
                      promptPrepared.text !== "" && (
                        <Label className="ab-mb-2 ab-flex">
                          Keine dynamischen Einstellungen verfügbar
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
                            value={
                              dynamicFieldValues[field.key] || field.default
                            }
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
                            value={
                              dynamicFieldValues[field.key] || field.default
                            }
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
                  </div>
                </TabsContent>

                <TabsContent value="promptEditor" className="ab-flex-1">
                  <textarea
                    onChange={onPromptChangeInternal}
                    name={`${name}PromptEditor`}
                    placeholder="Change the extracted content to re-generate the prompt"
                    value={prompt}
                    style={{ resize: "none" }}
                    className="ab-flex-1 ab-overflow-auto ab-w-full ab-h-full ab-overscroll-contain ab-ml-1 !ab-p-0 !-ab-mt-1 ab-outline-none !ab-text-sm"
                  />
                </TabsContent>
              </Tabs>
              {/*
              <textarea
                onChange={onPromptChangeInternal}
                name={`${name}PromptEditor`}
                placeholder="Change the extracted content to re-generate the prompt"
                value={prompt}
                style={{ resize: "none" }}
                className="ab-flex-1 ab-overflow-auto ab-w-full ab-h-full ab-overscroll-contain ab-ml-1 ab-p-2 ab-outline-none !ab-text-sm"
              />
              */}
            </div>

            <div className="ab-flex ab-flex-col ab-ml-0 ab-mr-0 ab-pr-0 ab-justify-between">
              <span className="ab-flex ab-flex-row ab-justify-between ab-items-end">
                <Input
                  value={customInstruction}
                  name={`${name}PromptInstructionEditor`}
                  placeholder="Weitere Wünsche..."
                  className="!ab-block ab-mb-2 !ab-text-sm ab-h-12 ab-max-h-12"
                  onChange={(evt) => setCustomInstruction(evt.target.value)}
                />
                {!streamingInProgress && (
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
                    {streamingInProgress && (
                      <StopIcon className="ab-w-12 ab-h-12" />
                    )}
                  </Button>
                )}
                {streamingInProgress && (
                  <Button
                    size={"sm"}
                    className="ab-scale-75 ab-ftr-button ab-mr-0 !ab-h-14 !ab-w-14 !ab-rounded-full hover:!ab-bg-primary-foreground"
                    onClick={onStopPromptStreamingClick}
                  >
                    <StopIcon className="ab-w-12 ab-h-12" />
                  </Button>
                )}
              </span>
              <span className="ab-p-1 ab-px-2 !ab-text-xs ab-ftr-bg ab-rounded-sm ab-justify-between ab-flex ab-flex-row">
                <span style={{ fontSize: "0.7rem" }}>
                  Geschätzt: ~{promptPrepared.estimatedInputTokens} I/O ~
                  {promptPrepared.estimatedOutputTokens} ≈{" "}
                  {formatCurrencyForDisplay(
                    promptPrepared.price.toFixed(4),
                  ).replace(".", i18n.language === "en" ? "." : ",")}{" "}
                  {lastActualUsage &&
                    `| Ausgeführt: ${lastActualUsage.prompt_tokens} I/O ${
                      lastActualUsage.completion_tokens
                    } = ${
                      lastTotalPrice
                        ? formatCurrencyForDisplay(
                            lastTotalPrice.toFixed(4),
                          ).replace(".", i18n.language === "en" ? "." : ",")
                        : ""
                    }`}
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
