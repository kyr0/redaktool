import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import summaryPrompt from "../../../data/prompt-templates/summary.liquid";
import { useTranslation } from "react-i18next";

const editorAtom = atom<string>("");

export const SummaryModule = () => {
  const { t, i18n } = useTranslation();

  return (
    <GenericModule
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={summaryPrompt}
      name="summary"
      editorAtom={editorAtom}
      outputTokenScaleFactor={0.2}
    />
  );
};
