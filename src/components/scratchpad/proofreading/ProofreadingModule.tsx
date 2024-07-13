import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
import { useTranslation } from "react-i18next";

// @ts-ignore
import proofreadingPrompt from "../../../data/prompt-templates/proofreading.liquid?raw";

const editorAtom = atom<string>("");

export const ProofreadingModule = () => {
  const { t, i18n } = useTranslation();
  return (
    <GenericModule
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={proofreadingPrompt}
      name="proofreading"
      editorAtom={editorAtom}
      outputTokenScaleFactor={4}
    />
  );
};
