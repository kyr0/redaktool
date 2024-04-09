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

export function calculatePrice(tokens: number): number {
  // Define the price per token
  const pricePerToken = 0.00001;
  const totalPrice = tokens * pricePerToken;
  return totalPrice;
}

export function calculateTokensFromBudget(budget: number): number {
  // Define the price per token
  const pricePerToken = 0.00001;
  // Calculate the number of tokens that can be purchased with the given budget
  const tokens = budget / pricePerToken;
  return Math.floor(tokens); // Assuming you can only purchase whole tokens
}

export const calculatePrompt = (text: string): Partial<Prompt> => {
  const encoding = encodingForModel("gpt-4-turbo-preview");
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
