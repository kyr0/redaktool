export const OPEN_AI_API_KEY_NAME = "OPEN_AI_API_KEY";
export const ANTHROPIC_API_KEY_NAME = "ANTHROPIC_API_KEY";

export const PARTIAL_RESPONSE_TEXT_NAME = "PARTIAL_RESPONSE_TEXT";

export const PARTIAL_RESPONSE_NAME = "PARTIAL_RESPONSE";

export type SupportedActions = "model";

export interface MessageChannelMessage {
  action: SupportedActions;
  payload: any;
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

export interface EmbeddingModelMessage extends MessageChannelMessage {
  payload: MLModel;
}

export interface HyperParameters {
  autoTuneCreativity: number;
  autoTuneFocus: number;
  autoTuneGlossary: number;
}
