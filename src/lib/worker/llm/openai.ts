// https://github.com/dexaai/openai-fetch
import {
  OpenAIClient,
  type ChatParams,
  type ChatStreamResponse,
} from "openai-fetch";
import type { PromptApiOptions, PromptResponse } from "./prompt";

export const openAIPrompt = async (
  body: ChatParams,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };

  if (!body.model) {
    body.model = "gpt-4-turbo";
  }

  console.log("Using model:", body.model);

  const openai = new OpenAIClient(apiOptions);

  const start = Date.now();
  const completion = await openai.createChatCompletion(body);
  const end = Date.now();
  const elapsed = end - start;
  const topPChoice = completion.choices[0];

  const response = {
    message: topPChoice.message.content,
    actualUsage: completion.usage,
    finishReason: topPChoice.finish_reason,
    elapsed,
  };
  return response;
};
