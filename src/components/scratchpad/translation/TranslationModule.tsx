import { atom } from "nanostores";
import {
  promptTemplateTranslation,
  type TranslatePromptValues,
} from "../../../data/prompt-templates/translation";
import { GenericModule } from "../GenericModule";
import { useCallback } from "react";

const editorAtom = atom<string>("");

export const TranslationModule = () => {
  const getPromptValues = useCallback(() => {
    // TODO: get values from settings UI
    return {
      AUDIENCE: "news readers, adults, general public",
      TONE: "neutral, news article",
      TARGET_LANGUAGE: "German",
    } as TranslatePromptValues;
  }, []);

  return (
    <GenericModule
      defaultModelName="gpt-4o"
      onCustomInstructionChange={(instruction) => {
        //form.setValue("CUSTOM_INSTRUCTIONS", instruction);
      }}
      defaultPromptTemplate={promptTemplateTranslation}
      name="translation"
      editorAtom={editorAtom}
      getPromptValues={getPromptValues}
      outputTokenScaleFactor={1.2}
    >
      TODO
    </GenericModule>
  );
};
