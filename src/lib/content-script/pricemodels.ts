import { Tiktoken, encodingForModel, type TiktokenModel } from "js-tiktoken";
import priceModelsData from "../../data/price-models";
import type { Prompt } from "./prompt-template";
import claudeBpeRanks from "@anthropic-ai/tokenizer/claude.json";
import type { ModelProviderType } from "../worker/llm/prompt";

export interface PriceModel {
  input: number;
  output: number;
  provider: ModelProviderType;
  maxContextTokens: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  tikTokenModelName: TiktokenModel;
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
    throw new Error(`Model ${model} not found in price models`);
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
  const priceModel = getPriceModel(model);
  let estimatedInputTokens = 0;

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

  return {
    estimatedInputTokens,
    price: effectivePrice.total,
    priceOutput: effectivePrice.output,
    priceInput: effectivePrice.input,
    estimatedOutputTokens,
    maxContextTokens: priceModelsData[model].maxContextTokens,
  };
};
