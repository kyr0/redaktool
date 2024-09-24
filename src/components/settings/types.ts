import * as z from "zod";
import { aiInferenceProviderIdents } from "../../lib/content-script/ai-models";
import type { UseFormReturn } from "react-hook-form";

export const InferenceProviderNameSchema = z.enum(aiInferenceProviderIdents)

export const ModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["llm", "embed", "stt", "tts"]).default("llm"),
})

export const NewProviderFormSchema = z.object({
  inferenceProviderName: InferenceProviderNameSchema,
  name: z.string(),
  apiKey: z.string().min(2).optional(),
  baseURL: z.string().optional(),
  organizationId: z.string().optional(),
  projectId: z.string().optional(),
  user: z.string().optional(),
  models: z.array(ModelSchema)
});

export type InferenceProvider = z.infer<typeof NewProviderFormSchema>
export type ListOfInferenceProviders = Array<InferenceProvider>

export interface SettingsFieldProps {
  form: UseFormReturn<InferenceProvider>;
  mode: "update" | "create";
}
