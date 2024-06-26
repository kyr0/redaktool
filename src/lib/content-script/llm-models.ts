import llmsData from "../../data/llm-models";

export interface LLMModel {
  pk: string; // "openai-gpt-4o"
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
