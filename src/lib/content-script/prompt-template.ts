import type { TranslatePromptValues } from "../../data/prompt-templates/translation";
import { promptTemplateTranslation } from "../../data/prompt-templates/translation";
import { encodingForModel } from "js-tiktoken";

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

export type PromptNames = "translation";

export interface Prompt {
  text: string;
  encoded: number[];
  price: number;
}

// https://openai.com/api/pricing/
export const getPricePerToken = (model: string): number =>
  10 / 1000000; /** input: $5, output 15$, avg. $10 */

export const calculatePrice = (tokens: number): number =>
  tokens * 2 * getPricePerToken("gpt-4o");

export function calculateTokensFromBudget(budget: number): number {
  // Calculate the number of tokens that can be purchased with the given budget
  const tokens = budget / getPricePerToken("gpt-4o");
  return Math.floor(tokens); // Assuming you can only purchase whole tokens
}

export const calculatePrompt = (text: string): Partial<Prompt> => {
  const encoding = encodingForModel("gpt-4o");
  const encoded = encoding.encode(text);

  return {
    encoded,
    price: calculatePrice(encoded.length),
  };
};

// TODO: pass down selected model
export const generatePrompt = (
  promptName: PromptNames,
  values: TranslatePromptValues,
): Prompt => {
  let text = "";

  switch (promptName) {
    case "translation":
      text = promptTemplateTranslation;
      break;
  }
  text = applyTemplateValues(text, values);

  return {
    text,
    ...calculatePrompt(text),
  } as Prompt;
};
