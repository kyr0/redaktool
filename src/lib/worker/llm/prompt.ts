import { openai } from "./openai";
import { anthropic } from "./anthropic";
import { ollama } from "./ollama";
import { google } from "./google";
import { streamText, type LanguageModelV1 } from 'ai';
//import { loadApiKey } from '@ai-sdk/provider-utils';
import type { PromptCallSettings, InferenceProviderType, PromptApiOptions } from './interfaces';

export const promptStreaming = async (
  modelId: string,
  promptText: string,
  providerType: InferenceProviderType,
  onChunk: (text: string, elapsed: number) => void,
  onDone: (text: string, elapsed: number, usage: { completionTokens: number, promptTokens: number }) => void,
  onError: (error: unknown, elapsed: number) => void,
  callSettings: Partial<PromptCallSettings> = {},
  apiOptions: PromptApiOptions = {},
) => {

  const initialTime = Date.now();
  let time = Date.now();
  let modelInstance: LanguageModelV1

  switch (providerType) {
    // TODO: implement streaming for all providers

    case "anthropic": {
      modelInstance = anthropic(modelId, callSettings, apiOptions)
      break;
    }

    case "ollama": {
      modelInstance = ollama(modelId, callSettings, apiOptions)
      break;
    }

    case "google": {
      modelInstance = google(modelId, callSettings, apiOptions)
      break;
    }

    // OpenAI, 3rd party provider
    default: {
      modelInstance = openai(providerType, modelId, callSettings, apiOptions)
    }
  }

  try {
    const result = await streamText({
      model: modelInstance,
      system: promptText,
      prompt: "Continue",
      ...callSettings
    });
  
    let resultText = "";

    for await (const textPart of result.textStream) {
      onChunk(textPart, Date.now() - time);
      resultText += textPart
      time = Date.now();
    }
    onDone(resultText, Date.now() - initialTime, await result.usage);
  } catch (error) {
    onError(error, Date.now() - initialTime);
  }
};
