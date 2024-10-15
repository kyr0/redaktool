import {
  ArrowLeftCircle,
  CogIcon,
  GlobeIcon,
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
  type MilkdownEditorCreatedArgs,
} from "../MarkdownEditor";
import { AiModelDropdown, type ModelPreference } from "../AiModelDropdown";
import { format } from "date-fns";
import {
  compilePrompt,
  finalizePrompt,
  type Prompt,
} from "../../lib/content-script/prompt-template";
import { Button } from "../../ui/button";
import { useTranslation, Trans } from "react-i18next";
import {
  memo,
  useCallback,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import {
  mapUserLanguageCode,
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
} from "../../lib/content-script/stores/use-selection";
import {
  kmpSearchMarkdown,
  turndown,
} from "../../lib/content-script/turndown";
import { uuid } from "../../lib/content-script/uuid";
import {
  QuestionMarkCircledIcon,
  ReloadIcon,
  StopIcon,
} from "@radix-ui/react-icons";
import type { PromptTokenUsage } from "../../lib/worker/llm/interfaces";
import { Slider } from "../../ui/slider";
import { MiniInfoButton } from "../MiniInfoButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { cn } from "../../lib/content-script/utils";
import type { HyperParameters } from "../../shared";
import { AutosizeTextarea } from "../AutoresizeTextarea";
import { db } from "../../lib/content-script/db";
import { inferenceProvidersDbState } from "../settings/db";
import type { InferenceProvider } from "../settings/types";
import { useLlmStreaming } from "../../lib/content-script/llm";

const settingsFieldsStateDb = db<Record<string, string>>("settingsFields", {});
const modelPkStateDb = db<Record<string, ModelPreference>>("modelPk");
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
  isActive?: boolean;
  placeholder?: string;
  inputPlaceholder?: string;
  promptSettingsWrapperClassName?: string;
  editorAtom: WritableAtom<string>;
  inputEditorAtom: WritableAtom<string>;
  defaultPromptTemplate: string;
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

export const GenericModule: React.FC<GenericModuleProps> = memo(({
  value,
  inputValue,
  name,
  isActive,
  promptSettingsWrapperClassName,
  placeholder,
  inputPlaceholder,
  editorAtom,
  inputEditorAtom,
  defaultPromptTemplate,
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
  const customInstructionStateDb = db<string>(`customInstruction-${name}`, "");
  const [editorContent, setEditorContent] = useState(editorAtom.get());
  const [inputEditorContent, setInputEditorContent] = useState(inputEditorAtom.get());
  const [prompt, setPrompt] = useState(defaultPromptTemplate);
  const [modelPk, setModelPk] = useState<ModelPreference>();
  const [internalEditorArgs, setInternalEditorArgs] = useState<MilkdownEditorCreatedArgs>();
  const [internalInputEditorArgs, setInternalInputEditorArgs] = useState<MilkdownEditorCreatedArgs>();
  const [promptPrepared, setPromptPrepared] = useState<Prompt>({
    id: uuid(),
    original: defaultPromptTemplate,
    text: "",
    model: "",
    inferenceProvider: "openai",
    estimatedInputTokens: 0,
    price: 0,
    priceOutput: 0,
    priceInput: 0,
  });
  const textSelection$ = useStore(guardedSelectionGuaranteedAtom);
  const [editorEl, setEditorEl] = useState<HTMLElement | null>(null);
  const [inputEditorEl, setInputEditorEl] = useState<HTMLElement | null>(null);
  const [expertMode, setExpertMode] = useState(false); // sync expert mode with db
  const [dynamicFields, setDynamicFields] = useState<Array<ParseResult>>([]);
  const [dynamicFieldValues, setDynamicFieldValues] = useState<Record<string, string>>({});
  const [recompilingInProgress, setRecompilingInProgress] = useState(false);
  const [streamingInProgress, setStreamingInProgress] = useState(false);
  const [customInstruction, setCustomInstruction] = useState<string>("");
  const [promptContent, setPromptContent] = useState("");
  const [lastActualUsage, setLastActualUsage] = useState<PromptTokenUsage>();
  const [lastTotalPrice, setLastTotalPrice] = useState<number>();
  const [activeTab, setActiveTab] = useState<"context" | "promptEditor">("context");
  const [inferenceProviders, setInferenceProviders] = useState<Array<InferenceProvider>>([]);
  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null);
  const [isDoneStreaming, setIsDoneStreaming] = useState(false);
  const [promptIdSkipList, setPromptIdSkipList] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const storedCustomInstruction = await customInstructionStateDb.get();
      setCustomInstruction(storedCustomInstruction);
    })();
  }, []);

  const stopStreamCallback = useCallback(() => {
    setPromptIdSkipList((prev) => [...prev, currentPromptId!]);
    setStreamingInProgress(false);
  }, [promptIdSkipList, currentPromptId]);

  const onPayloadReceived = useCallback((chunk: any) => {
    console.log("onPayloadReceived", chunk);

    if (chunk.id === currentPromptId && !promptIdSkipList.find(_id => _id === chunk.id)) {
      if (!chunk.finished && !chunk.error) {
        setEditorContent((prev) => prev + chunk.text);
        scrollDownMax(editorEl);
      }

      if (chunk.finished) {
        console.log("finished streaming", chunk);
        setStreamingInProgress(false);
        setIsDoneStreaming(true);
      }

      if (chunk.error) {
        setStreamingInProgress(false);
        toast.error("Fehler beim Ausführen des Prompts", {
          icon: (
            <MessageCircleWarning className="ab-shrink-0 !ab-w-16 ab-pr-1" />
          ),
          description: chunk.error
        });
      }
    }
  }, [currentPromptId, editorEl, promptIdSkipList]);

  const startPromptStreaming = useLlmStreaming({ onPayloadReceived, name });

  useEffect(() => {
    scrollDownMax(editorEl);
  }, [editorEl]);

  useEffect(() => {
    (async() => {
      console.log("loading inference providers")
      const inferenceProviders: Array<InferenceProvider> = (await inferenceProvidersDbState.get()).sort((a, b) => a.name.localeCompare(b.name))
      setInferenceProviders(inferenceProviders)
      console.log("DONE loading inference providers", inferenceProviders)
    })()
  }, [name]);

  useEffect(() => {
    (async () => {
      const storedModelPk = await modelPkStateDb.get();
      if (storedModelPk?.[name] && typeof storedModelPk?.[name] !== "string") {
        console.log("loading inference providers storedModelPk", storedModelPk)
        setModelPk(storedModelPk[name]);
      }
    })();
  }, [name]);

  useEffect(() => {
    (async () => {
      const storedExpertMode = await expertModeStateDb.get();
      setExpertMode(storedExpertMode === 1);
    })();
  }, []);

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
    [activeTab],
  );

  useEffect(() => {
    (async () => {
      console.log("flip-flop", isActive, name);

      const storedFields = await settingsFieldsStateDb.get();
      const keys = Object.keys(storedFields);

      if (keys.length === 0) {
        return;
      }

      const fieldNames = keys
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

      setDynamicFieldValues((fieldValues) => {
        const nextState = ({
          ...fieldValues,
          ...deserialization,
        })

        console.log("SETTING setDynamicFieldValues flip-flop", isActive, name, nextState);

        return nextState;
      });
    })();
  }, [name, isActive]);

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
      console.log("flip-flop DB settingsFieldsStateDb set", name, newSerialization);

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

  const [autoTuneFocus, setAutoTuneFocus] = useState<number>(
    defaultHyperParameters.autoTuneFocus,
  );

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
    [],
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
    [],
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
    [],
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
  }, [isActive]);

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

        // reset selection
        guardedSelectionGuaranteedAtom.set(null);
      }
    }
  }, [textSelection$, editorContent]);

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
  }, [internalInputEditorArgs, onInputEditorCreated]);

  // sync editor content with extraction
  const onEditorChangeInternal = useCallback(
    (markdown: string) => {
      if (!streamingInProgress || isDoneStreaming) {
        setEditorContent(markdown);
      }

      if (isDoneStreaming) {
        setIsDoneStreaming(false);
      }
    },
    [streamingInProgress, isDoneStreaming],
  );
  
  // sync input editor content with extraction
  const onInputEditorChangeInternal = useCallback(
    (markdown: string) => {
      console.log("onInputEditorChangeInternal", markdown);
      setInputEditorContent((prev) => (prev !== markdown ? markdown : prev));
    },
    [setInputEditorContent],
  );

  const onEditorCreatedInternal = useCallback(
    (args: MilkdownEditorCreatedArgs) => {
      setEditorEl((prev) => (prev !== args.el ? args.el : prev));
      setInternalEditorArgs((prev) => (prev !== args ? args : prev));
    },
    [],
  );

  const onInputEditorCreatedInternal = useCallback(
    (args: MilkdownEditorCreatedArgs) => {
      console.log("onInputEditorCreatedInternal", args);
      setInputEditorEl((prev) => (prev !== args.el ? args.el : prev));
      setInternalInputEditorArgs((prev) => (prev !== args ? args : prev));
    },
    [],
  );

  const setInternalModelPk = useCallback(
    (value: ModelPreference) => {
      (async () => {
        setModelPk((prev) => (prev !== value ? value : prev));
        modelPkStateDb.set({
          ...(await modelPkStateDb.get()),
          [name]: value,
        });
      })();
    },
    [name, modelPkStateDb],
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

${promptPrepared.original?.replace(/\n/g, "\n")}
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
      console.log("onPromptChangeInternal", evt.target?.value);
      setPrompt((prev) => (prev !== evt.target?.value ? evt.target?.value : prev));
    },
    [],
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
        dynamicFields: Array<ParseResult>;
      }>((resolve, reject) => {
        (async () => {
          try {
            // first pass compiler for dynamic fields
            let parsedPrompt = await compilePrompt(prompt, getValidatedDynamicFieldValues());

            const dynamicFields = Object.keys(parsedPrompt.meta)
              .map((key) => parsedPrompt.meta[key])
              .sort((a, b) => a.order - b.order);

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
      modelPk,
      hyperParameters,
    }: any) => {
      return new Promise<Prompt>((resolve, reject) => {
        console.log("inferenceProviders?!", inferenceProviders, modelPk);
        const activeInferenceProvider = inferenceProviders.find((ip) => ip.name === modelPk.providerName)

        console.log("activeInferenceProvider?!", activeInferenceProvider);
        if (!activeInferenceProvider) {
          console.log("No active inference provider found", modelPk.providerName, "inferenceProviders", inferenceProviders);
          return;
        }

        setRecompilingInProgress(true);
        (async () => {
          try {
            console.log("compilePromptAndSyncFields editorContent", editorContent)

            // second pass value evaluation
            const compiledPrompt = await compilePromptAndSyncFields(prompt, {
              USER_LANGUAGE: mapUserLanguageCode(i18n.language),
              CONTENT: editorContent,
              MODEL_NAME: modelPk.model,
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
              modelPk.model, // actual model name (gpt-4o, etc.)
              activeInferenceProvider, // AI provider configured
              hyperParameters,
            );
            console.log("finalPrompt", finalPrompt);

            resolve(finalPrompt);
          } catch (e) {
            reject(e);
          } finally {
            setRecompilingInProgress(false);
          }
        })();
      });
    },
    [
      setRecompilingInProgress,
      compilePromptAndSyncFields,
      finalizePrompt,
      mapUserLanguageCode,
      i18n,
      textSelection$,
      inferenceProviders,
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
          console.log("generating prompt with content", "promptContent", promptContent, "inputEditorContent", inputEditorContent);
          setPromptPrepared(
            await generatePrompt({
              prompt,
              editorContent: promptContent || inputEditorContent,
              customInstruction,
              modelPk,
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
  );

  useEffect(() => {
    if (!inferenceProviders || !modelPk || !prompt) {
      console.log("Skipping prompt preparation", inferenceProviders, modelPk, prompt);
      return;
    }

    console.log("calling debouncedPreparePrompt", promptContent);

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
    inferenceProviders
  ]);

  // sync
  useEffect(() => {
    // cache the editor content
    editorAtom.set(editorContent);

    if (typeof onEditorContentChange === "function" && !streamingInProgress) {
      onEditorContentChange(editorContent);
    }
  }, [editorContent, streamingInProgress]);

  useEffect(() => {
    // cache the input editor content
    inputEditorAtom.set(inputEditorContent);

    if (typeof onInputEditorContentChange === "function") {
      onInputEditorContentChange(inputEditorContent);
    }
  }, [inputEditorContent]);

  useEffect(() => {
    // cache the custom instruction
    customInstructionStateDb.set(customInstruction);

    if (typeof onCustomInstructionChange === "function") {
      onCustomInstructionChange(customInstruction);
    }
  }, [customInstruction]);

  // back-sync
  useEffect(() => {
    setEditorContent((prev) => (prev !== value ? value || "" : prev));
  }, [value]);

  useEffect(() => {
    if (inputValue !== undefined) {
      setInputEditorContent((prev) => (prev !== inputValue ? inputValue : prev));
    }
  }, [inputValue]);

  const onPromptSendClick = useCallback(() => {
    (async () => {
      console.log("onPromptSendClick input", inputEditorContent);

      const finalPrompt = await generatePrompt({
        prompt,
        editorContent: promptContent || inputEditorContent,
        customInstruction,
        modelPk,
        hyperParameters: {
          autoTuneCreativity,
          autoTuneFocus,
          autoTuneGlossary,
        } as HyperParameters,
      });

      setStreamingInProgress(true);

      if (startPromptStreaming) {
        setCurrentPromptId(finalPrompt.id);

        setEditorContent((prev) =>  `${prev}

 
---
###### ⬇️ ${format(new Date(), 'dd.MM.yyyy')} ${format(new Date(), 'HH:mm')} Uhr  - ${modelPk?.providerName} - ${modelPk?.model} ⬇️
---
 

`);

        startPromptStreaming(finalPrompt);
      }
    })();
  }, [
    generatePrompt,
    setStreamingInProgress,
    customInstruction,
    promptContent,
    inputEditorContent,
    editorEl,
    modelPk,
    i18n.language,
    autoTuneCreativity,
    autoTuneFocus,
    autoTuneGlossary,
    expertMode,
  ]);

  const onHelpClick = useCallback(() => {
    window.open("https://github.com/kyr0/redaktool/wiki", "_blank");
  }, []);

  const onResetPromptClick = useCallback(() => {
    setPrompt(defaultPromptTemplate);
  }, []);

  console.log("re-render")

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel defaultSize={50} minSize={20}>
        <ResizablePanelGroup direction="horizontal">

          <ResizablePanel
            defaultSize={70}
            minSize={60}
            className="ab-h-full ab-flex ab-flex-col ab-w-full ab-pl-0"
          >
            <div className="ab-flex ab-w-full ab-h-full ab-overflow-auto">
              <Tabs
                value={activeTab}
                defaultValue={activeTab}
                className="ab-w-full ab-flex ab-flex-col ab-h-full ab-overflow-auto"
              >
                <div className="ab-flex ab-justify-between">
                  <TabsList className="!ab-p-0 !ab-m-0 !ab-min-h-8 !ab-h-8 !ab-justify-between !ab-w-full">
                    <span className="ab-flex ab-flex-row">
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
                    </span>
                    <div className="ab-flex ab-items-center ab-h-6 ab-ml-2">
                      <span className="ab-text-sm ab-mr-2">Experte</span>
                      <input
                        type="checkbox"
                        checked={expertMode}
                        onChange={onInternalSetExpertMode}
                        className="ab-h-4 ab-w-4"
                      />
                    </div>
                  </TabsList>
                  {activeTab === "promptEditor" && (
                    <span className="ab-flex">
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
                </TabsContent>
              </Tabs>
            </div>

            <div className="ab-flex ab-flex-col ab-ml-0 ab-mr-0 ab-pr-0 ab-justify-between !ab-pt-1">
              <span className="ab-flex ab-flex-row ab-justify-start ab-items-center">
                <span className="ab-text-sm ab-font-bold">
                  KI:&nbsp;
                </span>
                <AiModelDropdown
                  value={modelPk}
                  type="llm"
                  onChange={(value) => {
                    setInternalModelPk(value);
                  }}
                  options={inferenceProviders}
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

                    {modelPk?.inferenceProvider === "openai" && (
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
                  placeholder="Weitere Regeln für die KI..."
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
                    onClick={stopStreamCallback}
                  >
                    <StopIcon className="ab-w-12 ab-h-12" />
                  </Button>
                )}
              </span>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="ab-ml-1 ab-mr-1" />

          <ResizablePanel
            defaultSize={30}
            minSize={10}
            className="ab-h-full ab-flex ab-flex-col ab-w-full ab-pr-0 ab-overflow-y-auto"
          >
            <div className="ab-flex ab-flex-col ab-w-full ab-h-full ab-overflow-auto">
              <div className="ab-ftr-bg ab-flex ab-flex-row ab-justify-between ab-rounded-sm !ab-h-6 ab-items-center ab-mb-2">
                <span className="ab-flex ab-flex-row ab-p-1 ab-px-2 ab-text-md">
                  Einstellungen
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
                  
                  {!modelPk && (
                    <Label className="ab-mb-2 ab-flex ab-text-sm ab-col-span-2">
                      <CogIcon className="ab-w-4 ab-h-4 ab-mr-1 ab-ml-1" />
                      Bitte wählen Sie ein KI-Modell aus.
                    </Label>
                  )}

                  {recompilingInProgress &&
                    promptPrepared.text !== "" && (
                      <Label className="ab-mb-2 ab-flex ab-text-sm ab-col-span-2">
                        <CogIcon className="ab-w-4 ab-h-4 ab-mr-1 ab-ml-1" />
                        Smart-Prompt wird kompiliert...
                      </Label>
                    )}

                  {!recompilingInProgress &&
                    dynamicFields.length === 0 &&
                    promptPrepared.text !== "" && (
                      <Label className="ab-mb-2 ab-flex ab-col-span-2 ab-ml-1">
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
                          value={
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
});
