import type { LLMs } from "../../lib/content-script/llm-models";
import openAiModels from "./openai.json";
import anthropicModels from "./anthropic.json";

export default [
  ...(openAiModels as LLMs),
  ...(anthropicModels as LLMs),
] as LLMs;
