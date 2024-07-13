import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import translationPrompt from "../../../data/prompt-templates/translation.liquid?raw";

const editorAtom = atom<string>("");

export const TranslationModule = () => {
  return (
    <GenericModule
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={translationPrompt}
      name="translation"
      editorAtom={editorAtom}
      outputTokenScaleFactor={1.2}
    />
  );
};
