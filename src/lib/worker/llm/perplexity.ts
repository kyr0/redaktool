import { openAIPrompt } from "./openai";
import type { PromptApiOptions, PromptResponse } from "./prompt";
import type { ChatParams } from "openai-fetch";

export interface PerplexityBody extends ChatParams {
  model: // Meta models
    | "llama-3-sonar-small-32k-chat"
    | "llama-3-sonar-small-32k-online"
    | "llama-3-sonar-large-32k-chat"
    | "llama-3-sonar-large-32k-online"
    // Open models
    | "llama-3-8b-instruct"
    | "llama-3-70b-instruct"
    | "mixtral-8x7b-instruct"
    | string /** https://docs.perplexity.ai/docs/model-cards */;
}

export const perplexityPrompt = async (
  body: PerplexityBody,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  if (!apiOptions.baseURL) {
    throw new Error("Please provide a base URL for the Messages API");
  }

  // see: https://docs.perplexity.ai/docs/getting-started
  return openAIPrompt(body, apiOptions);
};
