import type {
  PromptFinishReason,
  PromptTokenUsage,
} from "../worker/llm/prompt";
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
  original: string;
  text: string;
  model: string;
  estimatedInputTokens: number;
  price: number;
  priceOutput?: number;
  priceInput?: number;
  maxContextTokens?: number;
  estimatedOutputTokens?: number;
  values?: Record<string, string>;

  // hyperparameter auto-tuning
  autoTuneFocus?: number;
  autoTuneGlossary?: number;
  autoTuneCreativity?: number;
}

export interface PromptPartialResponse {
  id: string;
  text: string;
  errorMessage?: string;
  finishReason?: PromptFinishReason;
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
  model: string,
  outputTokenScaleFactor: number,
): Prompt => {
  return {
    id: uuid(),
    values,
    original: prompt,
    model,
    text: compiledPrompt,
    ...calculatePrompt(compiledPrompt, model, outputTokenScaleFactor),
  } as Prompt;
};
