import llmsData from "../../data/llm-models";
import type { InferenceProviderType } from "../worker/llm/interfaces";

export interface LLMModel {
  pk: string; // "openai-gpt-4o"
  provider: string; // "openai";
  ident: string; // "gpt-4o";
  label: string; // "OpenAI GPT-4o";
  maxContextTokens: number; // 8192;
  inferenceProviders: Array<InferenceProviderType>; // ["openai", "anthropic", "ollama", "google", "cohere", "huggingface"];
}

export type LLMs = Array<LLMModel>;

export const validateLLMs = (llmsData: LLMs): LLMs => {
  llmsData.forEach((llmData) => {
    if (typeof llmData.ident !== "string") {
      throw new Error(`Price model ${llmData.pk} missing ident`);
    }

    if (typeof llmData.label !== "string") {
      throw new Error(`Price model ${llmData.pk} missing label`);
    }

    if (typeof llmData.pk !== "string") {
      throw new Error(`Price model ${llmData.pk} missing pk`);
    }
  });
  return llmsData;
};

export const llms = validateLLMs(llmsData);

export const llmInferenceProviderIdents = ["openai", "anthropic", "ollama", "google", "cohere", "huggingface"] as const;

export const llmInferenceProviders = [{
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
}] as const;

export const llmProviders = Array.from(
  new Map(
    llms.map((llm) => [
      llm.provider,
      {
        ident: llm.provider,
        inferenceProviders: llm.inferenceProviders,
        label: llm.label.split(" ")[0],
        knownModels: llms
          .filter((llm2) => llm2.provider === llm.provider)
          .map((llm) => ({
            modelId: llm.pk.split("-").slice(1).join("-"),
            modelLabel: llm.label.split(" ").slice(1).join(" "),
          })),
      },
    ])
  ).values()
);

export const getLLMModel = (model: string): LLMModel => llms.find((llm) => llm.pk === model) as LLMModel

export const getModelListForInferenceProvider = (inferenceProvider: InferenceProviderType) => 
  llms
    .filter((llm) => llm.inferenceProviders.includes(inferenceProvider))
    .map((llm) => ({ id: llm.ident, name: llm.label, providerName: llm.provider }))

