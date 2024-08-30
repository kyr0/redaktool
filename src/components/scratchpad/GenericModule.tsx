import {
  ArrowDown,
  ArrowLeftCircle,
  BombIcon,
  BookIcon,
  CogIcon,
  GlobeIcon,
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
  ReloadIcon,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { cn } from "../../lib/content-script/utils";
import { ScrollArea, ScrollBar } from "../../ui/scroll-area";
import { Badge } from "../../ui/badge";
import type { HyperParameters } from "../../shared";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../ui/accordion";
import { AutosizeTextarea } from "../AutoresizeTextarea";
import { db } from "../../lib/content-script/db";
//import { PromptEditor } from "./prompteditor/PromptEditorCodeMirror";
//import { PromptEditor } from "./prompteditor/PromptEditorCodeMirror";

const settingsFieldsStateDb = db<Record<string, string>>("settingsFields");
const modelPkStateDb = db<Record<string, string>>("modelPk", {});
const expertModeStateDb = db<number>("expertMode", 0);

export interface DynamicFieldsSerialization {
  [key: string]: string;
}

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
  inputValue?: string;
  name: string;
  placeholder?: string;
  inputPlaceholder?: string;
  promptSettingsWrapperClassName?: string;
  editorAtom: WritableAtom<string>;
  inputEditorAtom: WritableAtom<string>;
  defaultPromptTemplate: string;
  outputTokenScaleFactor: number;
  defaultModelName: string;
  getPromptValues?: () => Record<string, string>;
  onCustomInstructionChange?: (instruction: string) => void;
  onEditorCreated?: (
    args: CallbackArgs & { args: MilkdownEditorCreatedArgs },
  ) => void;
  onInputEditorCreated?: (
    args: CallbackArgs & { args: MilkdownEditorCreatedArgs },
  ) => void;
  onEditorContentChange?: (markdown: string) => void;
  onInputEditorContentChange?: (markdown: string) => void;
  onPromptChange?: (args: CallbackArgs) => void;
  onPromptShare?: (args: CallbackArgs) => void;
}

const defaultHyperParameters: HyperParameters = {
  autoTuneCreativity: 70,
  autoTuneFocus: 0,
  autoTuneGlossary: 0,
};
const hyperParametersStateDb = db<HyperParameters>(
  "hyperparameters",
  defaultHyperParameters,
);

export const GenericModule: React.FC<GenericModuleProps> = ({
  value,
  inputValue,
  name,
  promptSettingsWrapperClassName,
  placeholder,
  inputPlaceholder,
  editorAtom,
  inputEditorAtom,
  defaultPromptTemplate,
  outputTokenScaleFactor,
  defaultModelName,
  onEditorCreated,
  onInputEditorCreated,
  onCustomInstructionChange,
  onEditorContentChange,
  onInputEditorContentChange,
  onPromptChange,
  onPromptShare,
  getPromptValues,
  children,
}) => {
  const { t, i18n } = useTranslation();
  const [editorContent, setEditorContent] = useState<string>(editorAtom.get());
  const [inputEditorContent, setInputEditorContent] = useState<string>(
    inputEditorAtom.get(),
  );
  const [prompt, setPrompt] = useState<string>(defaultPromptTemplate);
  const [stopStreamCallback, setStopStreamCallback] = useState<{
    stopStream: Function;
  }>();
  const [modelPk, setModelPk] = useState<string>(defaultModelName);
  const [internalEditorArgs, setInternalEditorArgs] =
    useState<MilkdownEditorCreatedArgs>();
  const [internalInputEditorArgs, setInternalInputEditorArgs] =
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
  const [inputEditorEl, setInputEditorEl] = useState<HTMLElement | null>(null);
  const [expertMode, setExpertMode] = useState<boolean>(false); // sync expert mode with db
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
  const [activeTab, setActiveTab] = useState<"context" | "promptEditor">(
    "context",
  );

  useEffect(() => {
    (async () => {
      const storedExpertMode = await expertModeStateDb.get();
      setExpertMode(storedExpertMode === 1);
    })();
  }, [expertModeStateDb]);

  const onInternalSetExpertMode = useCallback(
    (evt: any) => {
      // toggle
      setExpertMode(evt.target.checked);
      expertModeStateDb.set(evt.target.checked ? 1 : 0);

      // if expert mode is disabled, switch to context tab
      if (!evt.target.checked && activeTab === "promptEditor") {
        setActiveTab("context");
      }
    },
    [setExpertMode, activeTab],
  );

  useEffect(() => {
    (async () => {
      const storedFields = await settingsFieldsStateDb.get();
      const fieldNames = Object.keys(storedFields)
        .filter((key) => key.indexOf(":") !== -1)
        // sort by name, LOCAL first, then GLOBAL
        .sort((a, b) => {
          const aNamespaces = a.split(":");
          const bNamespaces = b.split(":");
          if (aNamespaces[0] === "LOCAL" && bNamespaces[0] === "GLOBAL") {
            return -1;
          }
          if (aNamespaces[0] === "GLOBAL" && bNamespaces[0] === "LOCAL") {
            return 1;
          }
          return 0;
        });

      const deserialization: Record<string, string> = {};

      for (const fieldName of fieldNames) {
        const namespaces = fieldName.split(":");

        if (namespaces[0] === "LOCAL" && namespaces[1] === name) {
          deserialization[namespaces[2]] = storedFields[fieldName];
        } else if (namespaces[0] === "GLOBAL") {
          deserialization[namespaces[1]] = storedFields[fieldName];
        }
      }

      // store in db
      setDynamicFieldValues((fieldValues) => ({
        ...fieldValues,
        ...deserialization,
      }));
    })();
  }, [name]);

  useEffect(() => {
    (async () => {
      const storedFields = await settingsFieldsStateDb.get();
      const fieldNames = Object.keys(dynamicFieldValues);
      const newSerialization: DynamicFieldsSerialization = {};

      for (const fieldName of fieldNames) {
        let serializationKey = "";
        const dynamicField = dynamicFields.find((f) => f.key === fieldName);
        if (dynamicField?.global === true) {
          serializationKey = `GLOBAL:${fieldName}`;
        } else {
          serializationKey = `LOCAL:${name}:${fieldName}`;
        }
        newSerialization[serializationKey] = dynamicFieldValues[fieldName];
      }

      // store in db, don't override, merge
      settingsFieldsStateDb.set({
        ...storedFields,
        ...newSerialization,
      });
    })();
  }, [dynamicFieldValues, dynamicFields, name]);

  // hyper parameters
  const [autoTuneCreativity, setAutoTuneCreativity] = useState<number>(
    defaultHyperParameters.autoTuneCreativity,
  );
  /*
  const [autoTuneFocusActivated, setAutoTuneFocusActivated] =
    useState<boolean>(false);
    */

  const [autoTuneFocus, setAutoTuneFocus] = useState<number>(
    defaultHyperParameters.autoTuneFocus,
  );
  /*
  const [autoTuneGlossaryActivated, setAutoTuneGlossaryActivated] =
    useState<boolean>(false);
    */
  const [autoTuneGlossary, setAutoTuneGlossary] = useState<number>(
    defaultHyperParameters.autoTuneGlossary,
  );

  const onInternalSetAutoTuneCreativity = useCallback(
    (value: Array<number>) => {
      setAutoTuneCreativity(value[0]);

      (async () => {
        const hyperParameters = await hyperParametersStateDb.get();
        hyperParameters.autoTuneCreativity = value[0];
        hyperParametersStateDb.set(hyperParameters);
      })();
    },
    [setAutoTuneCreativity, hyperParametersStateDb],
  );

  const onInternalSetAutoTuneFocus = useCallback(
    (value: Array<number>) => {
      setAutoTuneFocus(value[0]);

      (async () => {
        const hyperParameters = await hyperParametersStateDb.get();
        hyperParameters.autoTuneFocus = value[0];
        hyperParametersStateDb.set(hyperParameters);
      })();
    },
    [setAutoTuneFocus, hyperParametersStateDb],
  );

  const onInternalSetAutoTuneGlossary = useCallback(
    (value: Array<number>) => {
      setAutoTuneGlossary(value[0]);

      (async () => {
        const hyperParameters = await hyperParametersStateDb.get();
        hyperParameters.autoTuneGlossary = value[0];
        hyperParametersStateDb.set(hyperParameters);
      })();
    },
    [setAutoTuneGlossary, hyperParametersStateDb],
  );

  useEffect(() => {
    (async () => {
      const hyperParameters = await hyperParametersStateDb.get();
      setAutoTuneCreativity(
        hyperParameters.autoTuneCreativity ||
          defaultHyperParameters.autoTuneCreativity,
      );

      setAutoTuneFocus(
        hyperParameters.autoTuneFocus || defaultHyperParameters.autoTuneFocus,
      );

      setAutoTuneGlossary(
        hyperParameters.autoTuneGlossary ||
          defaultHyperParameters.autoTuneGlossary,
      );
    })();
  }, [hyperParametersStateDb]);

  const onResetHyperParametersClick = useCallback(() => {
    // db
    hyperParametersStateDb.set(defaultHyperParameters);

    setAutoTuneCreativity(defaultHyperParameters.autoTuneCreativity);
    setAutoTuneFocus(defaultHyperParameters.autoTuneFocus);
    setAutoTuneGlossary(defaultHyperParameters.autoTuneGlossary);
  }, []);

  useEffect(() => {
    setPromptContent(inputEditorContent);
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
  }, [internalEditorArgs, onEditorCreated, prompt]);

  useEffect(() => {
    if (typeof onInputEditorCreated === "function" && internalInputEditorArgs) {
      onInputEditorCreated({
        editorContent,
        prompt,
        setEditorContent,
        setPrompt,
        promptPrepared,
        setPromptPrepared,
        args: internalInputEditorArgs,
      });
    }
  }, [internalInputEditorArgs, onInputEditorCreated, prompt]);

  // sync editor content with extraction
  const onEditorChangeInternal = useCallback(
    (markdown: string) => {
      setEditorContent(markdown);
    },
    [setEditorContent],
  );

  // sync input editor content with extraction
  const onInputEditorChangeInternal = useCallback(
    (markdown: string) => {
      console.log("onInputEditorChangeInternal", markdown);
      setInputEditorContent(markdown);
    },
    [setInputEditorContent],
  );

  const onEditorCreatedInternal = useCallback(
    (args: MilkdownEditorCreatedArgs) => {
      setEditorEl(args.el);
      setInternalEditorArgs(args);
    },
    [setEditorEl, setInternalEditorArgs],
  );

  const onInputEditorCreatedInternal = useCallback(
    (args: MilkdownEditorCreatedArgs) => {
      console.log("onInputEditorCreatedInternal", args);
      setInputEditorEl(args.el);
      setInternalInputEditorArgs(args);
    },
    [setInputEditorEl, setInternalInputEditorArgs],
  );

  useEffect(() => {
    (async () => {
      const storedModelPk = await modelPkStateDb.get();
      setModelPk(storedModelPk[name] || defaultModelName);
    })();
  }, [modelPkStateDb, name, defaultModelName]);

  const setInternalModelPk = useCallback(
    (value: string) => {
      (async () => {
        setModelPk(value);
        modelPkStateDb.set({
          ...(await modelPkStateDb.get()),
          [name]: value,
        });
      })();
    },
    [setModelPk, name, modelPkStateDb],
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
    //(value: string) => {
    //  setPrompt(value);

    (evt: any) => {
      console.log("onPromptChangeInternal", evt.target?.value);
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
      prompt,
    ],
  );

  const generatePrompt = useCallback(
    ({
      prompt,
      editorContent,
      customInstruction,
      modelName,
      hyperParameters,
    }: any) => {
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
              HYPER_FOCUS: hyperParameters.autoTuneFocus,
              HYPER_CREATIVITY: hyperParameters.autoTuneCreativity,
              HYPER_GLOSSARY: hyperParameters.autoTuneGlossary,
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
              hyperParameters,
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
      prompt,
    ],
  );

  const debouncedPreparePrompt = useDebouncedCallback(
    useCallback(
      ({
        promptContent,
        prompt,
        customInstruction,
        modelPk,
        hyperParameters,
      }) => {
        requestAnimationFrame(async () => {
          setPromptPrepared(
            await generatePrompt({
              prompt,
              editorContent: promptContent || inputEditorContent,
              customInstruction,
              modelName: modelPk,
              hyperParameters,
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
        inputEditorContent,
        prompt,
        modelPk,
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
      hyperParameters: {
        autoTuneCreativity,
        autoTuneFocus,
        autoTuneGlossary,
      } as HyperParameters,
    });
  }, [
    promptContent,
    prompt,
    customInstruction,
    modelPk,
    autoTuneCreativity,
    autoTuneFocus,
    autoTuneGlossary,
  ]);

  // sync
  useEffect(() => {
    // cache the editor content
    editorAtom.set(editorContent);

    if (typeof onEditorContentChange === "function") {
      onEditorContentChange(editorContent);
    }
  }, [editorContent]);

  useEffect(() => {
    // cache the input editor content
    inputEditorAtom.set(inputEditorContent);

    if (typeof onInputEditorContentChange === "function") {
      onInputEditorContentChange(inputEditorContent);
    }
  }, [inputEditorContent]);

  // back-sync
  useEffect(() => {
    setEditorContent(value || "");
  }, [value]);

  useEffect(() => {
    setInputEditorContent(inputValue || "");
  }, [inputValue]);

  const onPromptSendClick = useCallback(() => {
    (async () => {
      let isBeginning = true;
      let originalText = "";
      let partialText = "";

      console.log("onPromptSendClick input", inputEditorContent);

      const finalPrompt = await generatePrompt({
        prompt,
        editorContent: promptContent || inputEditorContent,
        customInstruction,
        modelName: modelPk,
        hyperParameters: {
          autoTuneCreativity,
          autoTuneFocus,
          autoTuneGlossary,
        } as HyperParameters,
      });

      setStreamingInProgress(true);

      const reflush = () => {
        setTimeout(() => {
          requestAnimationFrame(() => {
            if (originalText.trim() !== "") {
              setEditorContent(`${originalText}\n---\n${partialText || ""}`);
            } else {
              setEditorContent(`${partialText || ""}`);
            }
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

              return `${prev || ""}${isBeginning && originalText.trim() !== "" ? "\n---\n" : ""}${
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
    inputEditorContent,
    outputTokenScaleFactor,
    editorEl,
    modelPk,
    i18n.language,
    autoTuneCreativity,
    autoTuneFocus,
    autoTuneGlossary,
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

  const onResetPromptClick = useCallback(() => {
    setPrompt(defaultPromptTemplate);
  }, []);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={50} minSize={20}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel
            defaultSize={30}
            minSize={10}
            className="ab-h-full ab-flex ab-flex-col ab-w-full ab-pr-2 ab-overflow-y-auto"
          >
            <div className="ab-flex ab-flex-col ab-w-full ab-h-full ab-overflow-auto">
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-justify-between ab-rounded-sm !ab-h-6 ab-items-center ab-mb-2">
                <span className="ab-flex ab-flex-row ab-p-1 ab-px-2 ab-text-md">
                  Einstellungen:
                </span>
                <span className="ab-mr-1">
                  <MiniInfoButton>
                    Diese Einstellungen werden automatisch mit den Texteingaben
                    an die KI gesendet.
                  </MiniInfoButton>
                </span>
              </div>
              <div
                className={`ab-flex ab-w-full ab-h-full ab-items-center ab-justify-start ab-flex-col ab-p-0 ab-overflow-y-auto ${
                  promptSettingsWrapperClassName || ""
                }`}
              >
                <div className="ab-w-full ab-grid ab-items-start ab-grid-cols-2 ab-gap-2 ab-gap-y-2 ab-overflow-y-auto">
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
                    <div
                      key={field.key}
                      className={`ab-w-full ${
                        field.type === "textarea" ? "ab-col-span-2" : ""
                      }`}
                    >
                      <Label className="ab-mb-1 ab-flex ab-justify-between ab-items-center">
                        <span className="ab-flex ab-flex-row ab-items-center !ab-text-sm">
                          {field.label}{" "}
                          {field.global && (
                            <>
                              <GlobeIcon className="ab-ml-1 ab-h-4 ab-w-4" />
                            </>
                          )}
                        </span>
                        {field.info && (
                          <MiniInfoButton>{field.info}</MiniInfoButton>
                        )}
                      </Label>

                      {(field.type === "text" || field.type === "number") && (
                        <Input
                          type={field.type || "text"}
                          name={`${name}${field.key}Input`}
                          placeholder={field.label}
                          value={dynamicFieldValues[field.key] || field.default}
                          className="!ab-block !ab-text-sm ab-h-8"
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
                          <SelectTrigger className="ab-h-8">
                            <SelectValue
                              placeholder={field.label}
                              className="!ab-text-sm"
                            />
                          </SelectTrigger>
                          <SelectContent className="ab-z-[2147483646]">
                            {(field.options || []).map((option) => (
                              <SelectItem
                                className="!ab-text-sm"
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
              </div>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="ml-1 mr-1" />

          <ResizablePanel
            defaultSize={70}
            minSize={60}
            className="ab-h-full ab-flex ab-flex-col ab-w-full ab-pl-2"
          >
            <div className="ab-flex ab-w-full ab-h-full ab-overflow-auto">
              <Tabs
                value={activeTab}
                defaultValue={activeTab}
                className="ab-w-full ab-flex ab-flex-col ab-h-full ab-overflow-auto"
              >
                <div className="ab-flex ab-justify-between">
                  <TabsList className="!ab-p-0 !ab-m-0  !ab-min-h-8 !ab-h-8 ab-justify-between">
                    <TabsTrigger
                      className={cn(
                        "ab-text-sm",
                        activeTab === "context"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item ab-bg-secondary",
                      )}
                      value="context"
                      onClick={() => setActiveTab("context")}
                    >
                      Text-Eingabe&nbsp;
                      <MiniInfoButton>
                        Der Text, der hier eingegben wird, wird von der KI
                        verarbeitet. Also z.B. für die Übersetzung.
                      </MiniInfoButton>
                    </TabsTrigger>
                    {expertMode && (
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
                        Prompt-Editor&nbsp;
                        <MiniInfoButton>
                          Im Prompt-Editor können die genauen Instruktionen, die
                          an die KI gesendet werden, angepasst werden. Außerdem
                          werden RAG-Worlflow-Abläufe und Einstellungen hier
                          dynamisch geskripted. Dieser Bereich ist für Experten
                          mit Prompt Engineering-Erfahrung gedacht.
                        </MiniInfoButton>
                      </TabsTrigger>
                    )}
                    <div className="ab-flex ab-items-center ab-h-6 ab-ml-2">
                      <span className="ab-text-sm ab-mr-2">Expertenmodus</span>
                      <input
                        type="checkbox"
                        checked={expertMode}
                        onChange={onInternalSetExpertMode}
                        className="ab-h-4 ab-w-4"
                      />
                    </div>
                  </TabsList>
                  {activeTab === "promptEditor" && (
                    <span>
                      <Button
                        size={"sm"}
                        className="ab-ftr-button  ab-bg-secondary !ab-ml-2 !ab-h-6 hover:ab-ftr-bg-halfcontrast ab-origin-right"
                        onClick={onResetPromptClick}
                      >
                        <ArrowLeftCircle className="ab-w-4 ab-h-4 ab-mr-1" />
                        <span>Zurücksetzen</span>
                      </Button>

                      <Button
                        size={"sm"}
                        className=" ab-ftr-button  ab-bg-secondary !ab-ml-2 !ab-h-6 hover:ab-ftr-bg-halfcontrast ab-origin-right"
                        onClick={onSharePromptClick}
                      >
                        <ShareIcon className="ab-w-4 ab-h-4 ab-mr-1" />
                        <span>Teilen</span>
                      </Button>

                      <Button
                        size={"sm"}
                        className="ab-ftr-button  ab-bg-secondary !ab-ml-2 !ab-h-6 hover:ab-ftr-bg-halfcontrast ab-origin-right"
                        onClick={onHelpClick}
                      >
                        <QuestionMarkCircledIcon className="ab-w-4 ab-h-4 ab-mr-1" />
                        <span>Hilfe</span>
                      </Button>
                    </span>
                  )}
                </div>
                <TabsContent
                  value="context"
                  className="ab-flex-1 ab-h-full ab-overflow-y-scroll"
                >
                  <MarkdownEditor
                    name={`${name}InputEditor`}
                    defaultValue={inputEditorContent}
                    placeholder={inputPlaceholder}
                    value={inputEditorContent}
                    showToolbar={false}
                    onChange={onInputEditorChangeInternal}
                    onCreated={onInputEditorCreatedInternal}
                  />
                </TabsContent>

                <TabsContent value="promptEditor" className="ab-flex-1">
                  <textarea
                    onChange={onPromptChangeInternal}
                    name={`${name}PromptEditor`}
                    placeholder="Change the extracted content to re-generate the prompt"
                    value={prompt}
                    style={{ resize: "none" }}
                    className="ab-flex-1 ab-overflow-auto ab-w-full ab-h-full ab-overscroll-contain ab-ml-1 !ab-p-0 !-ab-mt-1 ab-outline-none !ab-text-sm !ab-font-mono"
                  />
                  {/*
                  <PromptEditor
                    onChange={onPromptChangeInternal}
                    value={prompt}
                    className="ab-flex-1 ab-overflow-auto ab-w-full ab-h-full ab-overscroll-contain ab-ml-1 !ab-p-0 !-ab-mt-1 ab-outline-none !ab-text-sm"
                  />
                  */}
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
              <span className="ab-flex ab-flex-row ab-justify-start ab-items-center">
                <span className="ab-text-sm">KI-Modell:&nbsp;</span>
                <AiModelDropdown
                  value={modelPk}
                  onChange={(value) => {
                    setInternalModelPk(value);
                  }}
                  options={llmModels.map((m) => ({
                    label: m.label
                      .replace(new RegExp(m.provider, "gi"), "")
                      .trim(),
                    value: m.pk,
                  }))}
                />
                {expertMode && (
                  <>
                    <span className="ab-text-sm">&nbsp; | Kreativ:&nbsp;</span>

                    <span className="ab-w-20">
                      <Slider
                        min={0}
                        max={100}
                        step={0.1}
                        defaultValue={[autoTuneCreativity]}
                        onValueChange={onInternalSetAutoTuneCreativity}
                      />
                    </span>
                    <span className="ab-text-sm">
                      &nbsp;{autoTuneCreativity}%&nbsp;
                    </span>

                    <MiniInfoButton>
                      Beeinflusst das Vorkommen neuer Assoziationen, Wörter,
                      Strukturen sowie die Abweichung vom definierten Stil.
                    </MiniInfoButton>

                    {modelPk.indexOf("openai") > -1 && (
                      <>
                        <span className="ab-text-sm">&nbsp;Fokus:&nbsp;</span>

                        <span className="ab-w-20">
                          <Slider
                            min={-100}
                            max={100}
                            step={0.1}
                            defaultValue={[autoTuneFocus]}
                            onValueChange={onInternalSetAutoTuneFocus}
                          />
                        </span>
                        <span className="ab-text-sm">
                          &nbsp;
                          {autoTuneFocus !== 0 ? `${autoTuneFocus}%` : "⌀"}{" "}
                          &nbsp;
                        </span>

                        <MiniInfoButton>
                          Ein höherer Fokus limitiert die Anzahl der Themen und
                          die Diversität der Assoziationen über den gesamten
                          Text hinweg. Das kann hilfreich sein, wenn von einem
                          spezifischen Thema und einem Konsens weniger
                          abgewichen werden soll.
                        </MiniInfoButton>

                        <span className="ab-text-sm">
                          &nbsp;Vokabular:&nbsp;
                        </span>

                        <span className="ab-w-20">
                          <Slider
                            min={-100}
                            max={100}
                            step={0.1}
                            defaultValue={[autoTuneGlossary]}
                            onValueChange={onInternalSetAutoTuneGlossary}
                          />
                        </span>
                        <span className="ab-text-sm">
                          &nbsp;
                          {autoTuneGlossary !== 0
                            ? `${autoTuneGlossary}%`
                            : "⌀"}{" "}
                          &nbsp;
                        </span>

                        <MiniInfoButton>
                          Limitiert die Anzahl unterschiedlicher Wörter und
                          verringert somit den lexikalischen Reichtum. Das kann
                          bei Übersetzungen und Fachtexten hilfreich sein, wenn
                          es auf eine spezifische Terminologie ankommt.
                        </MiniInfoButton>
                      </>
                    )}

                    <Button
                      size={"sm"}
                      className="ab-ftr-button ab-bg-secondary !ab-ml-2 hover:ab-ftr-bg-halfcontrast !ab-h-5 "
                      onClick={onResetHyperParametersClick}
                    >
                      <ReloadIcon className="ab-w-3 ab-h-3 ab-mr-1" />
                    </Button>
                  </>
                )}
              </span>
              <span className="ab-flex ab-flex-row ab-justify-between ab-items-end">
                <AutosizeTextarea
                  maxHeight={100}
                  value={customInstruction}
                  name={`${name}PromptInstructionEditor`}
                  placeholder="Stelle links die Einstellungen ein. Sende hier weitere Anforderungen..."
                  className="!ab-block ab-mb-2 !ab-text-sm ab-h-12"
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
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
      <VerticalResizeHandle withHandle />
      <ResizablePanel
        defaultSize={50}
        minSize={20}
        className="ab-h-full ab-flex ab-justify-strech ab-flex-col"
      >
        <span className=" ab-p-1 ab-px-2 !ab-text-xs ab-ftr-bg ab-rounded-sm ab-justify-between ab-flex ab-flex-row">
          <span className="ab-justify-start ab-items-center ab-flex ab-flex-row">
            <span className="ab-font-bold">🤖 KI-Ergebnisse:&nbsp;</span>
          </span>
          {/*
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
                */}
          {/*
                €; verbleibende Tokens:{" "}
                {formatCurrencyForDisplay(
                  calculateTokensFromBudget(20 ),
                )}
                */}
          {(recompilingInProgress || streamingInProgress) && (
            <span className="ab-flex ab-flex-row ab-items-center ab-justify-end">
              {recompilingInProgress && (
                <Label className="ab-flex">Wird verarbeitet...</Label>
              )}
              {streamingInProgress && (
                <Label className="ab-flex">Wird generiert...</Label>
              )}
              <Label className="ab-flex">
                <LoadingSpinner className="ab-w-4 ab-h-4 ab-ml-1" />
              </Label>
            </span>
          )}
        </span>

        <div className="ab-w-full ab-h-full ab-overflow-y-auto">
          <MarkdownEditor
            defaultValue={editorContent}
            placeholder={placeholder}
            name={`${name}Editor`}
            showToolbar={false}
            onChange={onEditorChangeInternal}
            onCreated={onEditorCreatedInternal}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
