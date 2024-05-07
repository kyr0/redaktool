import type Anthropic from "@anthropic-ai/sdk";
import type { GenerateRequest } from "cohere-ai/api";
import { openAIPrompt } from "./openai";
import { coherePrompt } from "./cohere";
import { anthropicPrompt } from "./anthropic";
import { type HuggingFaceBody, huggingFacePrompt } from "./huggingface";
import { ollamaPrompt, type OllamaBody } from "./ollama";
import { type GeminiOptions, geminiPrompt } from "./gemini";
import type { ChatParams } from "openai-fetch";

export interface PromptTokenUsage {
  completion_tokens: number | undefined;
  prompt_tokens: number | undefined;
  total_tokens: number | undefined;
}

export interface PromptResponse {
  message?: string | null;
  actualUsage: PromptTokenUsage | undefined;
  finishReason:
    | string
    | null
    | "function_call"
    | "stop"
    | "length"
    | "tool_calls"
    | "content_filter";
  elapsed: number; // in milliseconds
}

export interface PromptApiOptions {
  baseURL?: string;
  hostingLocation?: string;
  apiKey?: string;
}

export type ProviderType =
  | "openai"
  | "anthropic"
  | "cohere"
  | "huggingface"
  | "ollama"
  | "gemini";

// non-streaming, single, system-prompt completion with any LLM
export const systemPrompt = async (
  promptText: string,
  providerType: ProviderType,
  promptOptions:
    | Partial<GenerateRequest>
    | Partial<Anthropic.Messages.MessageCreateParamsNonStreaming>
    | Partial<ChatParams>
    | Partial<HuggingFaceBody>
    | Partial<OllamaBody>
    | Partial<GeminiOptions> = {},
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  switch (providerType) {
    case "cohere": {
      return coherePrompt(
        {
          ...(promptOptions as GenerateRequest),
          prompt: promptText,
        },
        apiOptions,
      );
    }
    case "anthropic": {
      return anthropicPrompt(
        {
          ...(promptOptions as Anthropic.Messages.MessageCreateParamsNonStreaming),
          messages: [{ role: "user", content: promptText }],
          system: promptText,
        },
        apiOptions,
      );
    }
    case "huggingface": {
      return huggingFacePrompt(
        {
          ...(promptOptions as ChatParams),
          messages: [
            {
              role: "system",
              content: promptText,
            },
          ],
        },
        apiOptions,
      );
    }
    case "ollama": {
      return ollamaPrompt(
        {
          ...(promptOptions as OllamaBody),
          messages: [
            {
              role: "system",
              content: promptText,
            },
          ],
        },
        apiOptions,
      );
    }
    case "gemini": {
      return geminiPrompt(
        {
          ...(promptOptions as GeminiOptions),
          contents: [
            {
              role: "user",
              parts: [{ text: promptText }],
            },
          ],
        },
        apiOptions,
      );
    }
    // openai
    default: {
      return openAIPrompt(
        {
          ...(promptOptions as ChatParams),
          messages: [
            {
              role: "system",
              content: promptText,
            },
          ],
        },
        apiOptions,
      );
    }
  }
};
