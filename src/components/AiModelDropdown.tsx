import { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import { ArrowDown } from "lucide-react";
import type { InferenceProviderType } from "../lib/worker/llm/interfaces";
import type { InferenceProvider } from "./settings/types";
import type { AIModelType } from "../lib/content-script/ai-models";

export type ModelPreference = {
  inferenceProvider: InferenceProviderType;
  model: string;
  providerName: string;
}

export interface AiModelEntry {
  value: string;
  label: string;
}

export interface AiModelDropdownProps {
  value?: ModelPreference;
  type: AIModelType;
  options: Array<InferenceProvider>;
  onChange: (value: ModelPreference) => void;
}

export function AiModelDropdown({
  value,
  options,
  type,
  onChange,
}: AiModelDropdownProps) {
  const { t, i18n } = useTranslation();
  const [selectedInferenceProvider, setSelectedInferenceProvider] = useState<InferenceProvider | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelPreference | null>(null);
  const [selectedModelName, setSelectedModelName] = useState<string>();

  useEffect(() => {
    const model = selectedInferenceProvider?.models
      .filter(_model => _model.type === type)
      .find(_model => _model.id === selectedModel?.model);

    if (model && selectedInferenceProvider) {
      setSelectedModelName(model.name.replace(selectedInferenceProvider.name, "").trim());
    }
  }, [selectedModel, selectedInferenceProvider, type]);

  useEffect(() => {
    let foundModel = false;
    if (value) {
      console.log("DEFAULT value", value);
      const selectedInferenceProvider = options.find(
        (option) => option.inferenceProviderName === value.inferenceProvider
      );

      if (selectedInferenceProvider) {
        const hasModel = selectedInferenceProvider.models.find(
          (_model) => _model.id === value.model
        );

        if (hasModel) {
          setSelectedInferenceProvider(selectedInferenceProvider);
          setSelectedModel(value);
          foundModel = true;
        }
      }
    }

    if (!foundModel) {
      setSelectedInferenceProvider(null);
      setSelectedModel(null);
    }
  }, [value, options]);

  // Validate model belongs to the selected provider, reset if not
  useEffect(() => {
    if (selectedInferenceProvider && selectedModel) {
      const validModel = selectedInferenceProvider.models.some(
        (model) => model.id === selectedModel.model && model.type === type
      );

      if (!validModel) {
        setSelectedModel(null);
      }
    }
  }, [selectedInferenceProvider, selectedModel, type]);

  // Trigger onChange only when selectedModel is valid
  useEffect(() => {
    if (selectedModel) {
      onChange(selectedModel);
    }
  }, [selectedModel, onChange]);

  return (
    <span className="ab-flex ab-row">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size={"sm"}
            className="!ab-text-xs !ab-h-5 !ab-px-1 hover:!ab-bg-primary-foreground"
          >
            {options.length === 0
              ? "KI-Anbieter konfigurieren"
              : selectedInferenceProvider
              ? `${selectedInferenceProvider.name}`
              : "KI-Anbieter wählen..."}
            <ArrowDown className="ab-w-3 ab-h-3 ab-ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="ab-z-[2147483646]">
          <DropdownMenuLabel>KI-Anbieter wählen:</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {options
            .filter((option) =>
              option.models.find((model) => model.type === type)
            )
            .map((option) => (
              <DropdownMenuItem
                key={`${option.name}-item}`}
                onSelect={() => {
                  setSelectedInferenceProvider(option);

                  if (option.models?.[0]) {
                    setSelectedModel({
                      inferenceProvider: option.inferenceProviderName,
                      model: option.models[0].id,
                      providerName: option.name,
                    });
                  } else {
                    setSelectedModel(null);
                  }
                }}
              >
                {option.name}
              </DropdownMenuItem>
            ))}

          {options.length === 0 && (
            <DropdownMenuItem>
              <span>
                Klicken Sie im Menü links auf Einstellungen <br />
                und konfigurieren Sie mit "+ Neu" <br />
                mindestens einen KI-Anbieter.
              </span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedInferenceProvider && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size={"sm"}
              className="!ab-text-xs !ab-h-5 !ab-px-1 hover:!ab-bg-primary-foreground !ab-ml-1"
            >
              {selectedModel && selectedModelName
                ? selectedModelName
                : "KI-Modell wählen..."}
              <ArrowDown className="ab-w-3 ab-h-3 ab-ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="ab-z-[2147483646]">
            <DropdownMenuLabel>KI-Modell wählen</DropdownMenuLabel>
            <DropdownMenuSeparator />

            {selectedInferenceProvider.models
              .filter((model) => model.type === type)
              .map((option) => (
                <DropdownMenuItem
                  key={`${option.name}-item}`}
                  onSelect={() => {
                    setSelectedModel({
                      inferenceProvider:
                        selectedInferenceProvider.inferenceProviderName,
                      model: option.id,
                      providerName: selectedInferenceProvider.name,
                    });
                  }}
                >
                  {option.name
                    .replace(selectedInferenceProvider.name, "")
                    .trim()}
                </DropdownMenuItem>
              ))}

            {!selectedModel && selectedInferenceProvider.models.length === 0 && (
              <DropdownMenuItem>
                <span>
                  Klicken Sie im Menü links auf Einstellungen <br />
                  und konfigurieren Sie für den KI-Anbieter: <br />
                  - {selectedInferenceProvider.name}
                  <br />
                  mit "+ Neu" mindestens ein KI-Modell.
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </span>
  );
}
