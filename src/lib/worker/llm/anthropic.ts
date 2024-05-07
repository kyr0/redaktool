import Anthropic from "@anthropic-ai/sdk";
import type {
  PromptApiOptions,
  PromptResponse,
  PromptTokenUsage,
} from "./prompt";

// uses global fetch() by default
export const anthropicPrompt = async (
  body: Partial<Anthropic.Messages.MessageCreateParamsNonStreaming>,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };

  const anthropic = new Anthropic({
    apiKey: apiOptions.apiKey,
  });

  if (!body.model) {
    body.model = "claude-3-opus-20240229";
  }
  console.log("Using model:", body.model);

  if (!body.max_tokens) {
    body.max_tokens = 4096;
  }

  if (!body.temperature) {
    body.temperature = 0.7;
  }

  const start = Date.now();
  /**
    system: "my prompt",
    messages: [{ role: "user", content: "Hello, world" }],
   */
  const completion = await anthropic.messages.create(
    body as Anthropic.Messages.MessageCreateParamsNonStreaming,
  );
  const end = Date.now();
  const elapsed = end - start;

  const response = {
    message: completion.content.map((c) => c.text).join(""),
    actualUsage: {
      completion_tokens: completion.usage.output_tokens,
      prompt_tokens: completion.usage.input_tokens,
      total_tokens:
        completion.usage.input_tokens + completion.usage.output_tokens,
    } as PromptTokenUsage,
    finishReason: completion.stop_reason,
    elapsed,
  };
  return response;
};
