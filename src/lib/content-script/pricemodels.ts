//import { Tiktoken, encodingForModel, type TiktokenModel } from "js-tiktoken";
import priceModelsData from "../../data/price-models";
import type { Prompt } from "./prompt-template";
//import claudeBpeRanks from "@anthropic-ai/tokenizer/claude.json";
import type { InferenceProviderType } from "../worker/llm/interfaces";

export interface PriceModel {
  input: number;
  output: number;
  provider: InferenceProviderType;
  maxContextTokens: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  tikTokenModelName: string;
}

export interface PriceModels {
  [modelPrimaryKey: string]: PriceModel;
}

export const validatePriceModels = (
  priceModelData: PriceModels,
): PriceModels => {
  const modelPrimaryKeys = Object.keys(priceModelData);

  modelPrimaryKeys.forEach((modelPrimaryKey) => {
    const priceModel = priceModelData[modelPrimaryKey];

    if (typeof priceModel.input !== "number") {
      throw new Error(`Price model ${modelPrimaryKey} missing input price`);
    }
    if (typeof priceModel.output !== "number") {
      throw new Error(`Price model ${modelPrimaryKey} missing output price`);
    }
    if (typeof priceModel.maxContextTokens !== "number") {
      throw new Error(
        `Price model ${modelPrimaryKey} missing max context tokens`,
      );
    }
    if (
      !priceModel.tikTokenModelName ||
      typeof priceModel.tikTokenModelName !== "string"
    ) {
      throw new Error(
        `Price model ${modelPrimaryKey} missing TikToken model name or is not a of type string`,
      );
    }
  });
  return priceModelData;
};

export const priceModels = validatePriceModels(priceModelsData);

export const getPriceModel = (model: string) => {
  if (!priceModels[model]) {
    // dynamic price model
    return {
      input: 0,
      output: 0,
      provider: "unknown",
      maxContextTokens: 0,
      maxInputTokens: 0,
      maxOutputTokens: 0,
      tikTokenModelName: "unknown",
    };
  }
  return priceModels[model];
};

export interface EffectivePrice {
  input: number;
  output: number;
  total: number;
}

export const calculateEffectivePrice = (
  priceModel: PriceModel,
  inputTokens: number,
  outputTokens: number,
): EffectivePrice => {
  const input = priceModel.input * inputTokens;
  const output = priceModel.output * outputTokens;
  return {
    input,
    output,
    total: input + output,
  };
};

export const calculatePrompt = (
  text: string,
  model = "openai-gpt-4-turbo",
  outputScaleFactor = 2, // avg output length is 2x input length
): Partial<Prompt> => {

  /*
  let estimatedInputTokens = 0;
  const priceModel = getPriceModel(model);

  switch (priceModel.provider) {
    case "openai": {
      const encoding = encodingForModel(priceModel.tikTokenModelName);
      const encoded = encoding.encode(text);
      estimatedInputTokens = encoded.length;
      break;
    }
    case "anthropic": {
      const tokenizer = new Tiktoken(claudeBpeRanks);
      const encoded = tokenizer.encode(text.normalize("NFKC"), "all");
      estimatedInputTokens = encoded.length;

      break;
    }
    default:
      throw new Error(`Provider ${priceModel.provider} not supported`);
  }

  const estimatedOutputTokens = Number.parseInt(
    (estimatedInputTokens * outputScaleFactor).toFixed(0),
  );

  const effectivePrice = calculateEffectivePrice(
    priceModel,
    estimatedInputTokens,
    estimatedOutputTokens,
  );
  */

  return {
    estimatedInputTokens: 0,
    price: 0,//effectivePrice.total,
    priceOutput: 0,//effectivePrice.output,
    priceInput: 0,//effectivePrice.input,
    estimatedOutputTokens: 0,
    maxContextTokens: priceModelsData[model]?.maxContextTokens,
  };
};
