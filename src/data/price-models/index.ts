import type { PriceModels } from "../../lib/content-script/pricemodels";
import openAiPriceModels from "./openai.json";

export default {
  // TODO: add Anthropic price models
  ...openAiPriceModels,
} as PriceModels;
