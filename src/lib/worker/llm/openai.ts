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
    body.model = "gpt-4o";
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

export const openAIPromptStreaming = async (
  body: ChatParams,
  onChunk: (text: string) => void,
  onDone: (elapsed: number) => void,
  onError: (error: unknown) => void,
  apiOptions: PromptApiOptions = {},
): Promise<ChatStreamResponse | undefined> => {
  try {
    apiOptions = {
      ...apiOptions,
      apiKey: apiOptions.apiKey,
    };

    if (!body.model) {
      body.model = "gpt-4o";
    }

    console.log("Using model:", body.model);

    const openai = new OpenAIClient(apiOptions);

    async function readStreamChunks(stream: ReadableStream) {
      try {
        const reader = stream.getReader();
        async function read() {
          try {
            const { done, value } = await reader.read();
            if (done) {
              const end = Date.now();
              const elapsed = end - start;
              onDone(elapsed);
              return;
            }
            onChunk(value.choices[0].delta.content);
            read();
          } catch (error) {
            onError(error);
          }
        }
        read();
      } catch (error) {
        onError(error);
      }
    }

    const start = Date.now();
    const readableStream: ChatStreamResponse =
      await openai.streamChatCompletion(body);

    readStreamChunks(readableStream);

    return readableStream;
  } catch (error) {
    onError(error);
  }
};
