import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import titlesPrompt from "../../../data/prompt-templates/titles.liquid";
import { useTranslation } from "react-i18next";

const editorAtom = atom<string>("");

export const TitlesModule = () => {
  const { t, i18n } = useTranslation();

  return (
    <GenericModule
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={titlesPrompt}
      name="titles"
      editorAtom={editorAtom}
      outputTokenScaleFactor={0.1}
    />
  );
};
