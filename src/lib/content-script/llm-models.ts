import llmsData from "../../data/llm-models";
import type { ModelProviderType } from "../worker/llm/prompt";

export interface LLMModel {
  pk: string; // "openai-gpt-4o"
  provider: ModelProviderType; // "openai";
  ident: string; // "gpt-4o";
  label: string; // "OpenAI GPT-4o";
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

export const getLLMModel = (model: string) => {
  const llm = llms.find((llm) => llm.pk === model);
  if (!llm) {
    throw new Error(`Model ${model} not found in price models`);
  }
  return llm as LLMModel;
};
