import type { ModelPreference } from "../../components/AiModelDropdown";
import type { InferenceProvider } from "../../components/settings/types";
import { useMessageChannelContext } from "../../message-channel";
import type { HyperParameters } from "../../shared";
import type { InferenceProviderType, PromptApiOptions, PromptCallSettings, PromptTokenUsage } from "../worker/llm/interfaces";
import type { ParseSmartPromptResult } from "../worker/prompt";
import { calculatePrompt } from "./pricemodels";
import { uuid } from "./uuid";

/* deprecated

export const applyTemplateValues = (
  promptTemplate: string,
  values: Record<string, string>,
) => {
  const keys = Object.keys(values);
  let result = promptTemplate;
  keys.forEach((key) => {
    result = result.replaceAll(`{{${key}}}`, values[key].toString());
  });
  return result;
};

export const generatePrompt = <T>(
  text: string,
  values: T,
  model: ModelName,
  outputTokenScaleFactor: number,
): Prompt => {
  const processedText = applyTemplateValues(
    text,
    values as Record<string, string>,
  );

  return {
    values,
    original: text,
    text: processedText,
    ...calculatePrompt(processedText, model, outputTokenScaleFactor),
  } as Prompt;
};
*/

export interface Prompt {
  id: string;
  original?: string;
  text: string;
  model: string; // model identification (gpt-4o, etc.)
  inferenceProvider?: InferenceProviderType; // model provider (openai, anthropic, etc.)
  provider?: string; // model manufacturer (meta, openai, etc.)
  estimatedInputTokens?: number;
  price?: number;
  priceOutput?: number;
  priceInput?: number;
  maxContextTokens?: number;
  estimatedOutputTokens?: number;
  values?: Record<string, string>;
  hyperParameters?: HyperParameters;
  settingsOverrides?: Partial<PromptCallSettings>;
  apiOptionsOverrides?: Partial<PromptApiOptions>;
}

export interface CompilePrompt {
  promptTemplate: string;
  inputValues: Record<string, string>;
}

export interface PromptPartialResponse {
  id: string;
  text: string;
  errorMessage?: string;
  finishReason?: string;
  actualUsage?: PromptTokenUsage;
  finished: boolean;
  elapsed: number;
  totalPrice?: number;
}

export const compilePrompt = (
  promptTemplate: string,
  inputValues: Record<string, string>,
): Promise<ParseSmartPromptResult> => {

  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: "compile-prompt",
        text: JSON.stringify({ promptTemplate, inputValues }),
      },
      (response) => {
        const value = JSON.parse(response.value);
        if (response.success) {
          resolve(value);
        } else {
          reject(value.error);
        }
      },
    );
  });
};

export const finalizePrompt = (
  prompt: string,
  compiledPrompt: string,
  values: Record<string, string>,
  modelId: string,
  inferenceProvider: InferenceProvider,
  hyperParameters: HyperParameters,
): Prompt => {

  const apiOptionsOverrides: Partial<PromptApiOptions> = {};

  if (inferenceProvider.apiKey) {
    apiOptionsOverrides.apiKey = inferenceProvider.apiKey!;
  }

  if (inferenceProvider.baseURL) {
    apiOptionsOverrides.baseURL = inferenceProvider.baseURL!;
  }

  return {
    id: uuid(),
    values,
    original: prompt,
    model: modelId,
    inferenceProvider: inferenceProvider.inferenceProviderName,
    text: compiledPrompt,
    //...calculatePrompt(compiledPrompt, modelPk.model, outputTokenScaleFactor),
    hyperParameters,
    apiOptionsOverrides,
  } as Prompt;
};
