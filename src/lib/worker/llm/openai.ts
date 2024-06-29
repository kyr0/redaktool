// https://github.com/dexaai/openai-fetch
import {
  OpenAIClient,
  type ChatParams,
  type ChatStreamResponse,
} from "openai-fetch";
import type {
  PromptApiOptions,
  PromptResponse,
  PromptTokenUsage,
} from "./prompt";

export const openAIPrompt = async (
  body: ChatParams,
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  apiOptions = {
    ...apiOptions,
    apiKey: apiOptions.apiKey,
  };

  // default for OpenAI (GPT-4 Turbo, best reasoning)
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

export const openAIPromptStreaming = async (
  body: ChatParams,
  onChunk: (text: string, elapsed: number) => void,
  onDone: (text: string, elapsed: number, usage: PromptTokenUsage) => void,
  onError: (error: unknown, elapsed: number) => void,
  apiOptions: PromptApiOptions = {},
): Promise<ChatStreamResponse | undefined> => {
  const start = Date.now();
  try {
    apiOptions = {
      ...apiOptions,
      apiKey: apiOptions.apiKey,
    };

    if (!body.model) {
      body.model = "gpt-4-turbo";
    }

    console.log("Using model:", body.model);

    const openai = new OpenAIClient(apiOptions);

    async function readStreamChunks(stream: ReadableStream) {
      try {
        const reader = stream.getReader();
        let accumulated = "";
        let finishReason = "";
        let usage = {};
        async function read() {
          try {
            const { done, value } = await reader.read();
            const data = value?.choices ? value.choices[0] : undefined;

            if (data?.finish_reason) {
              finishReason = data.finish_reason;
            }

            if (value?.usage) {
              usage = value.usage;
            }

            if (done) {
              console.log("streaming done", usage, finishReason, accumulated);
              if (finishReason === "stop") {
                // TODO: max_tokens and "continue" not yet supported
                onDone(accumulated, Date.now() - start, usage);
              } else {
                onError(
                  new Error("Stream ended without completion."),
                  Date.now() - start,
                );
              }
              return;
            }

            console.log("streaming value", value);

            if (typeof data?.delta?.content !== "undefined") {
              accumulated += data.delta.content;
              onChunk(data.delta.content, Date.now() - start);
            }
            read();
          } catch (error) {
            console.log("streaming error", error);
            onError(error, Date.now() - start);
          }
        }
        read();
      } catch (error) {
        onError(error, Date.now() - start);
      }
    }

    const readableStream: ChatStreamResponse =
      await openai.streamChatCompletion({
        ...body,
        stream_options: {
          include_usage: true,
        },
      });

    readStreamChunks(readableStream);

    return readableStream;
  } catch (error) {
    onError(error, Date.now() - start);
  }
};

export type OpenAIPromptOptionsUnion = Partial<ChatParams>;

export const mapOpenAIPromptOptions = <T>(
  promptOptions: OpenAIPromptOptionsUnion,
): T =>
  ({
    model: promptOptions.model,
    temperature: promptOptions.temperature,
    n: promptOptions.n,
  }) as T;
