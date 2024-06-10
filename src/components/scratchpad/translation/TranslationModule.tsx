import { atom } from "nanostores";
import { promptTemplateTranslation } from "../../../data/prompt-templates/translation";
import { GenericModule } from "../GenericModule";
import { useCallback } from "react";

const editorAtom = atom<string>("");

export const TranslationModule = () => {
  const getPromptValues = useCallback(() => {
    return {};
  }, []);

  return (
    <GenericModule
      defaultModelName="gpt-4o"
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
