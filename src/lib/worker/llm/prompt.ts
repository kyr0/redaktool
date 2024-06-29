import type Anthropic from "@anthropic-ai/sdk";
//import type { GenerateRequest } from "cohere-ai/api";
import {
  mapOpenAIPromptOptions,
  openAIPrompt,
  openAIPromptStreaming,
} from "./openai";
//import { coherePrompt } from "./cohere";
import {
  anthropicPrompt,
  anthropicPromptStreaming,
  mapAnthropicPromptOptions,
  type AnthropicPromptOptionsUnion,
} from "./anthropic";
import { type HuggingFaceBody, huggingFacePrompt } from "./huggingface";
import { ollamaPrompt, type OllamaBody } from "./ollama";
import type { GeminiOptions } from "./gemini";
import type { ChatParams, ChatStreamResponse } from "openai-fetch";
import { perplexityPrompt } from "./perplexity";

export interface PromptTokenUsage {
  completion_tokens?: number;
  prompt_tokens?: number;
  total_tokens?: number;
}

export type PromptFinishReason =
  | string
  | null
  | "function_call"
  | "stop"
  | "length"
  | "tool_calls"
  | "content_filter";

export interface PromptResponse {
  message?: string | null;
  actualUsage?: PromptTokenUsage;
  finishReason: PromptFinishReason;
  elapsed: number; // in milliseconds
}

export interface PromptApiOptions {
  baseURL?: string;
  hostingLocation?: string;
  apiKey?: string;
}

export type ModelProviderType =
  | "openai"
  | "anthropic"
  //  | "cohere"
  | "huggingface"
  | "ollama"
  | "gemini"
  | "perplexity";

export type PromptOptionsUnion =
  //    | Partial<GenerateRequest>
  | Partial<Anthropic.Messages.MessageCreateParamsNonStreaming>
  | Partial<Anthropic.Messages.MessageCreateParamsStreaming>
  | Partial<ChatParams>
  | Partial<HuggingFaceBody>
  | Partial<OllamaBody>
  | Partial<GeminiOptions>;

// non-streaming, single, system-prompt completion with any LLM
export const systemPrompt = async (
  promptText: string,
  providerType: ModelProviderType,
  promptOptions: PromptOptionsUnion = {},
  apiOptions: PromptApiOptions = {},
): Promise<PromptResponse> => {
  switch (providerType) {
    /*
    case "cohere": {
      return coherePrompt(
        {
          ...(promptOptions as GenerateRequest),
          prompt: promptText,
        },
        apiOptions,
      );
    }
      */
    case "anthropic": {
      return anthropicPrompt(
        {
          ...mapAnthropicPromptOptions<Anthropic.Messages.MessageCreateParamsNonStreaming>(
            promptOptions as AnthropicPromptOptionsUnion,
          ),
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
    /*
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
    */
    case "perplexity": {
      return perplexityPrompt(
        {
          ...(promptOptions as ChatParams),
          messages: [
            {
              role: "system",
              content:
                "You are artificial intelligence assistant for fact-checking. You must base any verdict on evidence and the scientific method of reasoning, hence reason deductively. You need to respond in JSON format only. Example: { sources: [''], claim: 'Earth is flat.', verdict: false, explanation: '' }",
            },
            {
              role: "user",
              content: `Claim: ${promptText}`,
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
          ...mapOpenAIPromptOptions(promptOptions as ChatParams),
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

export const systemPromptStreaming = async (
  promptText: string,
  providerType: ModelProviderType,
  onChunk: (text: string, elapsed: number) => void,
  onDone: (text: string, elapsed: number, usage: PromptTokenUsage) => void,
  onError: (error: unknown, elapsed: number) => void,
  promptOptions: PromptOptionsUnion = {},
  apiOptions: PromptApiOptions = {},
) => {
  switch (providerType) {
    // TODO: implement streaming for all providers

    case "anthropic": {
      console.log("calling anthropic streaming");
      anthropicPromptStreaming(
        {
          ...mapAnthropicPromptOptions<Anthropic.Messages.MessageCreateParamsStreaming>(
            promptOptions as AnthropicPromptOptionsUnion,
          ),
          messages: [{ role: "user", content: promptText }],
          system: promptText,
        },
        onChunk,
        onDone,
        onError,
        apiOptions,
      );
      break;
    }

    // OpenAI
    default: {
      openAIPromptStreaming(
        {
          ...mapOpenAIPromptOptions(promptOptions as ChatParams),
          messages: [
            {
              role: "system",
              content: promptText,
            },
          ],
        },
        onChunk,
        onDone,
        onError,
        apiOptions,
      );
    }
  }
};
