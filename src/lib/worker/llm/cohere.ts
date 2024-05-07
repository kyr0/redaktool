import { CohereClient } from "cohere-ai";
import type { GenerateRequest } from "cohere-ai/api";
import type {
  PromptApiOptions,
  PromptResponse,
  PromptTokenUsage,
} from "./prompt";

// uses global fetch() when in non-Node env
export const coherePrompt = async (
  body: Partial<GenerateRequest>,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };
  const cohere = new CohereClient({
    token: apiOptions.apiKey,
  });

  const start = Date.now();

  if (!body.model) {
    body.model = "command-r-plus";
  }

  console.log("Using model:", body.model);

  if (!body.maxTokens) {
    body.maxTokens = 128 * 1000;
  }

  if (!body.temperature) {
    body.temperature = 0.3;
  }

  const completion = await cohere.generate(body as GenerateRequest);
  const end = Date.now();
  const elapsed = end - start;

  const response = {
    message: completion.generations.map((c) => c.text).join(""),
    actualUsage: {
      completion_tokens: completion.meta!.tokens?.outputTokens || 0,
      prompt_tokens: completion.meta!.tokens?.inputTokens || 0,
      total_tokens:
        (completion.meta!.tokens?.inputTokens || 0) +
        (completion.meta!.tokens?.outputTokens || 0),
    } as PromptTokenUsage,
    finishReason: "completed",
    elapsed,
  };
  return response;
};
