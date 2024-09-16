import type {
  PromptApiOptions, PromptCallSettings, InferenceProviderType
} from "./interfaces";
import type { LanguageModelV1 } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

export const openAIAutoTuneHyperparameters = <T>(
  promptOptions: PromptCallSettings,
  options: PromptApiOptions = {},
): T => {

  if (
    typeof promptOptions.temperature === "undefined" &&
    typeof options.autoTuneCreativity === "number"
  ) {
    // technical temperature scale is [0.0, 2.0], but human-acceptable results are [0.0, 1.0]
    // as long as we don't add other sampling methods such as nucleus sampling (top_p)
    promptOptions.temperature = options.autoTuneCreativity;

    if (typeof options.autoTuneFocus === "number") {
      // the higher the focus, the lower the temperature
      promptOptions.temperature = Math.max(
        0,
        (promptOptions.temperature || 0) - options.autoTuneFocus,
      );
    }

    if (
      typeof promptOptions.seed === "undefined" &&
      promptOptions.temperature < 0.05 // temperature approaches 0
    ) {
      // bias towards an even more deterministic result
      promptOptions.seed = 1337;
    }
  }

  if (
    typeof promptOptions.frequencyPenalty !== "number" &&
    typeof options.autoTuneGlossary === "number"
  ) {
    // scale frequency_penalty from variability scale [0.0, 1.0] to [-2.0, 2.0]
    promptOptions.frequencyPenalty = options.autoTuneGlossary * 4.0 - 2.0;
  }

  if (
    typeof promptOptions.presencePenalty !== "number" &&
    typeof options.autoTuneFocus === "number"
  ) {
    // scale presence_penalty from focus scale [0.0, 1.0] to [-2.0, 2.0], inverted
    promptOptions.presencePenalty = 2.0 - options.autoTuneFocus * 4.0;

    // applying nucleus sampling, so that the cumulative probability mass is limited (and thus, the output is likely to be more focussed)
    promptOptions.topP = 1 - Math.max(0, options.autoTuneFocus / 2);
  }
  return promptOptions as T;
};

export const openai = (providerType: InferenceProviderType, modelId: string, callSettings: PromptCallSettings, apiOptions: PromptApiOptions): LanguageModelV1 => {
  if (providerType === "openai") {
    callSettings = openAIAutoTuneHyperparameters<PromptCallSettings>(callSettings, apiOptions)
  }

  console.log("openai callSettings", callSettings)
  
  return createOpenAI({  
    baseURL: apiOptions.baseURL,
    apiKey: apiOptions.apiKey,
    compatibility: providerType === "openai" ? "strict" : "compatible",
    // project
    // organization
  }).chat(modelId, { /** logit bias, logprobs */})
}