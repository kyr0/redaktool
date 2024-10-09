import wellKnownLlms from "../../data/llm-models";
import wellKnownEmbeddingModels from "../../data/embedding-models";
import wellKnownTranscriptionModels from "../../data/transcription-models";
import type { InferenceProviderType } from "../worker/llm/interfaces";

export type AIModelType = "llm" | "embed" | "tts" | "stt"

export interface AIModel {
  pk: string; // "openai-gpt-4o"
  provider: string; // "openai";
  ident: string; // "gpt-4o";
  label: string; // "OpenAI GPT-4o";
  type: AIModelType; // "llm";
  maxContextTokens: number; // 8192;
  inferenceProviders: Array<InferenceProviderType>; // ["openai", "anthropic", "ollama", "google", "cohere", "huggingface", "deepgram"];
}

export type AIModels = Array<AIModel>;

export const validateAIModels = (aiModelsData: AIModels): AIModels => {
  aiModelsData.forEach((aiModelData) => {

    // fix, some models are missing type
    if (!aiModelData.type) {
      aiModelData.type = "llm"
    }

    if (typeof aiModelData.ident !== "string") {
      throw new Error(`Price model ${aiModelData.pk} missing ident`);
    }

    if (typeof aiModelData.label !== "string") {
      throw new Error(`Price model ${aiModelData.pk} missing label`);
    }

    if (typeof aiModelData.pk !== "string") {
      throw new Error(`Price model ${aiModelData.pk} missing pk`);
    }
  });
  return aiModelsData;
};

export const wellKnownAIModels = [
  ...validateAIModels(wellKnownLlms), 
  ...validateAIModels(wellKnownEmbeddingModels), 
  ...validateAIModels(wellKnownTranscriptionModels)
]

export const aiInferenceProviderIdents = ["openai", "anthropic", "ollama", "google", "cohere", "huggingface", "deepgram"] as const;

export const aiInferenceProviders = [{
  ident: "openai",
  label: "OpenAI"
}, {
  ident: "anthropic",
  label: "Anthropic"
}, {
  ident: "ollama",
  label: "Ollama"
}, {
  ident: "google",
  label: "Google"
}, {
  ident: "cohere",
  label: "Cohere"
}, {
  ident: "huggingface",
  label: "Hugging Face"
}, {
  ident: "deepgram",
  label: "Deepgram"
}] as const;

export const aiModelProviders = Array.from(
  new Map(
    wellKnownAIModels.map((aiModel) => [
      aiModel.provider,
      {
        ident: aiModel.provider,
        inferenceProviders: aiModel.inferenceProviders,
        label: aiModel.label.split(" ")[0],
        knownModels: wellKnownAIModels
          .filter((_aiModel) => _aiModel.provider === aiModel.provider)
          .map((_aiModel) => ({
            modelId: _aiModel.pk.split("-").slice(1).join("-"),
            modelLabel: _aiModel.label.split(" ").slice(1).join(" "),
          })),
      },
    ])
  ).values()
);

export const getWellKnownAIModel = (model: string): AIModel => wellKnownAIModels.find((aiModel) => aiModel.pk === model) as AIModel

export const getModelListForInferenceProvider = (inferenceProvider: InferenceProviderType) => 
  wellKnownAIModels
    .filter((aiModel) => aiModel.inferenceProviders.includes(inferenceProvider))
    .map((aiModel) => ({ id: aiModel.ident, name: aiModel.label, providerName: aiModel.provider, type: aiModel.type || "llm" }));

