import type { CompilePrompt, Prompt } from "./lib/content-script/prompt-template";
import type { ParseSmartPromptResult } from "./lib/worker/prompt";

export const OPEN_AI_API_KEY_NAME = "OPEN_AI_API_KEY";
export const ANTHROPIC_API_KEY_NAME = "ANTHROPIC_API_KEY";

export const PARTIAL_RESPONSE_TEXT_NAME = "PARTIAL_RESPONSE_TEXT";

export const PARTIAL_RESPONSE_NAME = "PARTIAL_RESPONSE";

export type SupportedActions = "model" | "compile-prompt" | "compile-prompt-result" | "prompt";

export interface MessageChannelPackage<T> {
  id: string;
  action: SupportedActions;
  payload: T;
}

export interface MLModel {
  type: string;
  id: string;
  fileName: string;
  path: string;
  blob: Blob;
  tokenizerConfig: any;
  tokenizer: Blob;
  config: any;
}

export interface EmbeddingModelMessage extends MessageChannelPackage<MLModel> {
  payload: MLModel;
}

export interface PromptMessage extends MessageChannelPackage<Prompt> {
  payload: Prompt;
}

export interface CompilePromptMessage extends MessageChannelPackage<CompilePrompt> {
  payload: CompilePrompt;
}

export interface CompilePromptResultMessage extends MessageChannelPackage<ParseSmartPromptResult> {
  payload: ParseSmartPromptResult;
}

export type MessageChannelMessage = EmbeddingModelMessage | PromptMessage | CompilePromptMessage | CompilePromptResultMessage;
export type MessageChannelPayload = MLModel | Prompt | CompilePrompt | ParseSmartPromptResult;

export interface HyperParameters {
  autoTuneCreativity: number;
  autoTuneFocus: number;
  autoTuneGlossary: number;
}

export const getNextId = () => {
  let id = 0;
  return (() => {
    id += 1;
    return id.toString();
  })();
}
