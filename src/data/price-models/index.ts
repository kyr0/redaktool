import type { PriceModels } from "../../lib/content-script/pricemodels";
import openAiPriceModels from "./openai.json";
import anthropicPriceModels from "./anthropic.json";

export default {
  ...openAiPriceModels,
  ...anthropicPriceModels,
} as PriceModels;
