import { encodingForModel } from "js-tiktoken";

// TODO: replace by https://github.com/handlebars-lang/handlebars.js
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

export interface Prompt {
  original: string;
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
  // @ts-ignore
  const encoding = encodingForModel("gpt-4o");
  const encoded = encoding.encode(text);

  return {
    encoded,
    price: calculatePrice(encoded.length),
  };
};

// TODO: pass down selected model
export const generatePrompt = <T>(text: string, values: T): Prompt => {
  text = applyTemplateValues(text, values as Record<string, string>);

  return {
    original: text,
    text,
    ...calculatePrompt(text),
  } as Prompt;
};
