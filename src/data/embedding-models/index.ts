import type { AIModels } from "../../lib/content-script/ai-models";
import openAiModels from "./openai.json";

export default [
  ...(openAiModels as AIModels),
] as AIModels;
