import type {
  PromptApiOptions, PromptCallSettings
} from "./interfaces";
import type { LanguageModelV1 } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

export const anthropic = (modelId: string, callSettings: PromptCallSettings, apiOptions: PromptApiOptions): LanguageModelV1 => {
  if (
    typeof callSettings.temperature === "undefined" &&
    typeof apiOptions.autoTuneCreativity === "number"
  ) {
    // technical temperature scale is [0.0, 2.0], but human-acceptable results are [0.0, 1.0]
    // as long as we don't add other sampling methods such as nucleus sampling (top_p)
    callSettings.temperature = apiOptions.autoTuneCreativity;


    if (
      typeof callSettings.seed === "undefined" &&
      callSettings.temperature < 0.05 // temperature approaches 0
    ) {
      // bias towards an even more deterministic result
      callSettings.seed = 1337;
    }
  }

  console.log("anthropic callSettings", callSettings)
  
  return createAnthropic({  
    apiKey: apiOptions.apiKey,
    headers: {
      "anthropic-dangerous-direct-browser-access": "true"
    }
  }).languageModel(modelId, { /** cacheControl  */})
}