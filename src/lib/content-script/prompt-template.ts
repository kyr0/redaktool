import { encodingForModel } from "js-tiktoken";
import type { ModelName } from "../worker/llm/prompt";

const priceModels = {
  "gpt-4o": {
    input: 0.000005,
    output: 0.000015,
    maxContextTokens: 128000,
  },
};

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
  priceOutput?: number;
  priceInput?: number;
  maxContextTokens?: number;
  estimatedOutputTokens?: number;
  values?: Record<string, string>;
}

export function calculatePriceValue(
  tokens: number,
  type: "input" | "output",
  model: ModelName,
): number {
  const pricePerToken = priceModels[model][type];
  const totalPrice = tokens * pricePerToken;
  return totalPrice;
}

// TODO: deprecated
export function calculateTokensFromBudget(budget: number): number {
  // Define the price per token
  const pricePerToken = 0.00001;
  // Calculate the number of tokens that can be purchased with the given budget
  const tokens = budget / pricePerToken;
  return Math.floor(tokens); // Assuming you can only purchase whole tokens
}

export const calculatePrompt = (
  text: string,
  model: ModelName = "gpt-4o",
  outputScaleFactor = 2, // avg output length is 2x input length
): Partial<Prompt> => {
  const encoding = encodingForModel(model);
  const encoded = encoding.encode(text);
  const priceInput = calculatePriceValue(encoded.length, "input", model);
  const estimatedOutputTokens = Number.parseInt(
    (encoded.length * outputScaleFactor).toFixed(0),
  );
  const priceOutput = calculatePriceValue(
    estimatedOutputTokens,
    "output",
    model,
  );

  return {
    encoded,
    price: priceInput + priceOutput,
    priceOutput,
    priceInput,
    estimatedOutputTokens,
    maxContextTokens: priceModels[model].maxContextTokens,
  };
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
