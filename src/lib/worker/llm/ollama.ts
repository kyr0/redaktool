import type {
  PromptApiOptions, PromptCallSettings
} from "./interfaces";
import type { LanguageModelV1 } from "ai";
import { createOllama } from "ollama-ai-provider";

export const ollama = (modelId: string, callSettings: PromptCallSettings, apiOptions: PromptApiOptions): LanguageModelV1 => {
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

  console.log("ollama callSettings", callSettings, "modelId", modelId);

  // must be added to the environment variables
  // OLLAMA_ORIGINS=chrome-extension://* ollama serve
  return createOllama({
    baseURL: apiOptions.baseURL,
  }).languageModel(modelId, { /** cacheControl  */})
}