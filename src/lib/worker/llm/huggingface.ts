import type { ChatParams } from "openai-fetch";
import { openAIPrompt } from "./openai";
import type { PromptApiOptions, PromptResponse } from "./prompt";

export interface HuggingFaceBody extends ChatParams {
  model: string;
}

export const huggingFacePrompt = async (
  body: HuggingFaceBody,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  if (!apiOptions.baseURL) {
    throw new Error("Please provide a base URL for the HuggingFace API");
  }

  if (!apiOptions.apiKey) {
    throw new Error("Please provide an API key for the HuggingFace API");
  }
  // see: https://huggingface.co/docs/text-generation-inference/messages_api
  return openAIPrompt(body, apiOptions);
};
