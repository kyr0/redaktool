import type { LLMs } from "../../lib/content-script/llm-models";
import openAiModels from "./openai.json";

export default {
  // TODO: add Anthropic price models
  ...(openAiModels as LLMs),
} as LLMs;
