import { db } from "../../lib/content-script/db";
import type { InferenceProvider } from './types';

export const inferenceProvidersDbState = db<Array<InferenceProvider>>("aiInferenceProviderConfigurations", []);