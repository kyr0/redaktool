import type { UseFormReturn } from "react-hook-form";
import type * as z from "zod";
import type { NewProviderFormSchema } from "./types";
import { ApiKeyField } from "./fields/ApiKey";
import { useCallback, useEffect, useState } from "react";
import { BaseUrlField } from "./fields/BaseUrl";
import { LanguageModelsField } from "./fields/LanguageModels";
import type { InferenceProviderType } from "../../lib/worker/llm/interfaces";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../ui/collapsible"
import { ArrowDown, ArrowUp, ArrowUpIcon, ChevronDown, ChevronUp, PlusIcon } from "lucide-react";
import { NameField } from "./fields/Name";
import { llmInferenceProviders } from "../../lib/content-script/llm-models";

export interface ProviderEditPanelProps {
  form: UseFormReturn<z.infer<typeof NewProviderFormSchema>>;
}

export const ProviderEditPanel: React.FC<ProviderEditPanelProps & { mode: "update" | "create"}> = ({ form, mode }) => {

  const [inferenceProviderName, setInferenceProviderName] = useState<InferenceProviderType>(form.getValues().inferenceProviderName); 
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);

  form.watch((data, { name, type }) => {
    if (name === "inferenceProviderName") {
      setInferenceProviderName(data.inferenceProviderName as InferenceProviderType);
    }
  });

  useEffect(() => {
    console.log("setting name?!?", form.getValues().name, inferenceProviderName)
    if (!form.getValues().name || mode === "create") {
      console.log("setting name!")
      form.setValue("name", llmInferenceProviders.find((llmInferenceProvider) => llmInferenceProvider.ident === inferenceProviderName)?.label || "");
    }
  }, [form, inferenceProviderName, mode])

  
  const onOpenChange = useCallback((isOpen: boolean) => {
    setAdvancedSettingsOpen(isOpen);
  }, []);

  return (
    <>
      {inferenceProviderName !== "ollama" && <ApiKeyField form={form} mode={mode} />}
      <LanguageModelsField form={form} mode={mode} models={form.getValues().models}/>
      <Collapsible onOpenChange={onOpenChange}>
        <CollapsibleTrigger className="ab-flex ab-flex-row ab-items-center ab-justify-start ab-font-bold">
        {advancedSettingsOpen && <ChevronDown className="ab-shrink-0 ab-w-6 ab-h-6" />}
        {!advancedSettingsOpen && <ChevronUp className="ab-shrink-0 ab-w-6 ab-h-6" />}
        Erweiterte Einstellungen: 
        </CollapsibleTrigger>
        <CollapsibleContent className="ab-mt-4 ab-mb-2">
          <NameField form={form} mode={mode} />
          {(inferenceProviderName === "openai" || inferenceProviderName === "ollama") && <BaseUrlField form={form} mode={mode} />}
        </CollapsibleContent>
    </Collapsible>
    </>
  )
}