import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/form";
import { Button } from '../../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import { Check, ArrowDown } from "lucide-react";
import { cn } from "../../../lib/content-script/utils";
import { llmProviders, llmInferenceProviders } from '../../../lib/content-script/llm-models';
import type { SettingsFieldProps } from "../types";
import { useEffect, useState } from "react";
import { inferenceProvidersDbState } from "../db";

export const ProviderChooserField = ({ form, disabled }: SettingsFieldProps & { disabled?: boolean }) => {

  const [selectableInferenceProviders, setSelectableInferenceProviders] = useState<Array<{ ident: string, label: string }>>(llmInferenceProviders.map((llmInferenceProvider) => ({ ident: llmInferenceProvider.ident, label: llmInferenceProvider.label })))

  /*
  useEffect(() => {
    (async() => {
      const inferenceProviders = await inferenceProvidersDbState.get();

      const filteredInferenceProviders = llmInferenceProviders.filter(
        (provider) => !inferenceProviders.some(
          (inferenceProvider) => inferenceProvider.inferenceProviderName === provider.ident
        )
      );
      setSelectableInferenceProviders(filteredInferenceProviders)
    })()
  }, [])
  */
 
  console.log("llmProviders", llmProviders, "llmInferenceProviders", llmInferenceProviders) 
  return (
    <FormField
      control={form.control}
      disabled={disabled}
      name="inferenceProviderName"
      render={({ field }) => (
        <FormItem className="ab-flex ab-flex-col">
          <FormLabel>⚙️ API-Schnittstelle:</FormLabel>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={"outline"}
                disabled={disabled}
                className="!ab-text-md"
              >
                 {field.value
                    ? llmInferenceProviders.find(
                        (llmInferenceProvider) => llmInferenceProvider.ident === field.value
                      )?.label
                    : "Select AI inference provider"}

                <ArrowDown className="ab-w-3 ab-h-3 ab-ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="ab-z-[2147483646]">
              {selectableInferenceProviders.map((selectableLlmInferenceProvider) => (
                <DropdownMenuItem
                  key={selectableLlmInferenceProvider.ident}
                  onSelect={() => {
                    console.log("selected", selectableLlmInferenceProvider.ident)
                    form.setValue("inferenceProviderName", selectableLlmInferenceProvider.ident as any)
                  }}
                  >
                  <Check
                    className={cn(
                      "ab-mr-2 ab-h-4 ab-w-4",
                      selectableLlmInferenceProvider.ident === field.value
                        ? "ab-opacity-100"
                        : "ab-opacity-0"
                    )}
                  /> <span>{llmInferenceProviders.find(llmInferenceProvider => llmInferenceProvider.ident === selectableLlmInferenceProvider.ident)?.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}