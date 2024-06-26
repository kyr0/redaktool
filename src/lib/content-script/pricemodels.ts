import { encodingForModel, type TiktokenModel } from "js-tiktoken";
import priceModelsData from "../../data/price-models";
import type { Prompt } from "./prompt-template";

export interface PriceModel {
  input: number;
  output: number;
  maxContextTokens: number;
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

export const calculatePrompt = (
  text: string,
  model = "openai-gpt-4-turbo",
  outputScaleFactor = 2, // avg output length is 2x input length
): Partial<Prompt> => {
  const priceModel = getPriceModel(model);
  const encoding = encodingForModel(priceModel.tikTokenModelName);
  const encoded = encoding.encode(text);
  const priceInput = encoded.length * priceModel.input;
  const estimatedOutputTokens = Number.parseInt(
    (encoded.length * outputScaleFactor).toFixed(0),
  );
  const priceOutput = estimatedOutputTokens * priceModel.output;

  return {
    encoded,
    price: priceInput + priceOutput,
    priceOutput,
    priceInput,
    estimatedOutputTokens,
    maxContextTokens: priceModelsData[model].maxContextTokens,
  };
};
