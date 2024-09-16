import type { CompilePrompt, Prompt } from "./lib/content-script/prompt-template";
import type { ParseSmartPromptResult } from "./lib/worker/prompt";

export const OPEN_AI_API_KEY_NAME = "OPEN_AI_API_KEY";
export const ANTHROPIC_API_KEY_NAME = "ANTHROPIC_API_KEY";

export const PARTIAL_RESPONSE_TEXT_NAME = "PARTIAL_RESPONSE_TEXT";

export const PARTIAL_RESPONSE_NAME = "PARTIAL_RESPONSE";

export type SupportedActions = "model" | "compile-prompt" | "compile-prompt-result" | "prompt" | "db-get" | "db-get-result" | "db-set" | "db-set-result";

export interface MessageChannelPackage<T> {
  id: string;
  success?: boolean;
  error?: unknown;
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

export interface DbKeyValue {
  key: string;
  value?: any;
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

export interface DbMessage extends MessageChannelPackage<DbKeyValue> {
  payload: DbKeyValue;
}

export type MessageChannelMessage = EmbeddingModelMessage | PromptMessage | CompilePromptMessage | CompilePromptResultMessage | DbMessage;
export type MessageChannelPayload = MLModel | Prompt | CompilePrompt | ParseSmartPromptResult | DbKeyValue;

export interface HyperParameters {
  autoTuneCreativity: number;
  autoTuneFocus: number;
  autoTuneGlossary: number;
}

let sequence = 0;
export const getNextId = (namespace: string) => {
  ++sequence;
  return `${namespace}-${Math.random()*100000}-${Date.now()}-${sequence}`
}
