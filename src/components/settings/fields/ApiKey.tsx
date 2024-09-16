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

const ApiKeyUrlMap: {
  [key: string]: string;
} = {
  "openai": "https://platform.openai.com/api-keys",
  "anthropic": "https://console.anthropic.com/settings/keys",
}

export const ApiKeyField = ({ form }: SettingsFieldProps) => {

  const [inferenceProviderName, setInferenceProviderName] = useState<InferenceProviderType>(form.getValues().inferenceProviderName); 

  form.watch((data, { name, type }) => {
    if (name === "inferenceProviderName") {
      setInferenceProviderName(data.inferenceProviderName as InferenceProviderType);
    }
  });
  
  return (
    <FormField
      control={form.control}
      name="apiKey"
      render={({ field }) => (
        <FormItem>
          <FormLabel>🔐 API-Schlüssel:</FormLabel>
          <FormControl>
            <Input
              className="ab-font-mono"
              placeholder={"Geben Sie hier den API-Schlüssel ein"}
              type="password"
              {...field}
            />
          </FormControl>
          <FormDescription>
            Dieser Schlüssel wird benötigt, um die API zu verwenden:{" "}
            <a
              href={ApiKeyUrlMap[inferenceProviderName]}
              target="_blank"
              rel="noreferrer"
              className="ab-text-sm"
            >
              API-Schlüssel abrufen 🔗
            </a>
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}