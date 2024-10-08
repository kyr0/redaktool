import type { AIModels } from "../../lib/content-script/ai-models";
import openAiModels from "./openai.json";
import anthropicModels from "./anthropic.json";
import metaModels from "./meta.json";

export default [
  ...(openAiModels as AIModels),
  ...(anthropicModels as AIModels),
  ...(metaModels as AIModels),
] as AIModels;
