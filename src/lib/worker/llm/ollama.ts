import { openAIPrompt } from "./openai";
import type { PromptApiOptions, PromptResponse } from "./prompt";
import type { ChatParams } from "openai-fetch";

export interface OllamaBody extends ChatParams {
  model:
    | "llama3"
    | "phi3"
    | "wizardlm2"
    | "mistral"
    | "gemma"
    | "mixtral"
    | string /** https://ollama.com/library */;
}

export const ollamaPrompt = async (
  body: OllamaBody,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  if (!apiOptions.baseURL) {
    throw new Error("Please provide a base URL for the HuggingFace API");
  }

  // see: https://ollama.com/blog/openai-compatibility
  return openAIPrompt(body, apiOptions);
};
