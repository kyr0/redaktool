import { useEffect, useState } from "react";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/form";
import { Input } from "../../../ui/input";
import type { SettingsFieldProps } from "../types";
import type { InferenceProviderType } from "../../../lib/worker/llm/interfaces";
import { llmInferenceProviderIdents, llmInferenceProviders } from "../../../lib/content-script/llm-models";

export const NameField = ({ form, mode }: SettingsFieldProps) => {

  return (
    <FormField
      control={form.control}
      name="name"
      render={({ field }) => (
        <FormItem className="ab-mb-2">
          <FormLabel>🏷️ Name:</FormLabel>
          <FormControl>
            <Input
              /*disabled={mode === "update"}*/
              className=""
              placeholder={"Eigener Name des KI-Anbieters"}
              type="text"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Wird verwendet, um diesen Anbieter in der Liste der Anbieter zu identifizieren.
            Ein abweichender Name ist sinnvoll, wenn mehrere OpenAI, Ollama- oder Huggingface-Schnittstellen mit unterschiedlichen Base-URLs verwendet werden. 
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}