export const OPEN_AI_API_KEY_NAME = "OPEN_AI_API_KEY";
export const ANTHROPIC_API_KEY_NAME = "ANTHROPIC_API_KEY";

export const PARTIAL_RESPONSE_TEXT_NAME = "PARTIAL_RESPONSE_TEXT";

export const PARTIAL_RESPONSE_NAME = "PARTIAL_RESPONSE";

export type SupportedActions = "model";

export interface TunnelMessage {
  action: SupportedActions;
  payload: any;
}
