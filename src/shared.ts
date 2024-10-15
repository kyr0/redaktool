import type { AudioMetaData } from "./lib/audio-dsp";
import type { CompilePrompt, Prompt } from "./lib/content-script/prompt-template";
import type { ParseSmartPromptResult } from "./lib/worker/prompt";
import type { TranscriptionResponse } from "./lib/worker/transcription/interfaces";

export const OPEN_AI_API_KEY_NAME = "OPEN_AI_API_KEY";
export const ANTHROPIC_API_KEY_NAME = "ANTHROPIC_API_KEY";

export const PARTIAL_RESPONSE_TEXT_NAME = "PARTIAL_RESPONSE_TEXT";

export const PARTIAL_RESPONSE_NAME = "PARTIAL_RESPONSE";

export type SupportedActions = "model" | 
  "compile-prompt" | "compile-prompt-result" | 
  "prompt" | 
  "db-get" | "db-get-result" | 
  "db-set" | "db-set-result" | 
  "process-transcription-audio" | "process-transcription-audio-result" |
  "transcribe" | "transcribe-result";

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

export interface AudioTranscriptionData {
  audioFile: File;
  metaData: AudioMetaData;
  waitingSpeechAudioBlob: Blob;
}

export type InferenceProviderType = "openai" | "deepgram";

export interface TranscriptionTask {
  blob: Blob; 
  codec: string;
  model: string;
  providerType: InferenceProviderType;
  diarize?: boolean;
  detect_language?: boolean;
  punctuate?: boolean;
  apiKey?: string;
  prompt?: string; // optional, previous transcription
}

export type SlicedAudioWavs = Array<{ blob: Blob; duration: number, fileType: string }>

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

export interface ErrorMessage extends MessageChannelPackage<null> {
  payload: null;
}

export interface ProcessTranscriptionAudioMessage extends MessageChannelPackage<AudioTranscriptionData> {
  payload: AudioTranscriptionData;
}

export interface ProcessTranscriptionAudioResultMessage extends MessageChannelPackage<SlicedAudioWavs> {
  payload: SlicedAudioWavs;
}

export interface TranscriptionMessage extends MessageChannelPackage<TranscriptionTask> {
  payload: TranscriptionTask;
}

export interface TranscriptionResultMessage extends MessageChannelPackage<TranscriptionResponse> {
  payload: TranscriptionResponse;
}

export type MessageChannelMessage = EmbeddingModelMessage | PromptMessage | CompilePromptMessage | CompilePromptResultMessage | DbMessage | ProcessTranscriptionAudioMessage | ErrorMessage | ProcessTranscriptionAudioResultMessage | TranscriptionMessage | TranscriptionResultMessage;
export type MessageChannelPayload = MLModel | Prompt | CompilePrompt | ParseSmartPromptResult | DbKeyValue | AudioTranscriptionData | SlicedAudioWavs | TranscriptionTask | TranscriptionResponse | null;

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
