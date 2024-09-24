import type { AIModels } from "../../lib/content-script/ai-models";
import openAiModels from "./openai.json";
import deepgramModels from "./deepgram.json";

export default [
  ...(openAiModels as AIModels),
  ...(deepgramModels as AIModels),
] as AIModels;
