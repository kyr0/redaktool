import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import coachPrompt from "../../../data/prompt-templates/coach.liquid?raw";
import { useTranslation } from "react-i18next";
const editorAtom = atom<string>("");

export const CoachModule = () => {
  const { t, i18n } = useTranslation();

  return (
    <GenericModule
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={coachPrompt}
      name="coach"
      editorAtom={editorAtom}
      outputTokenScaleFactor={4}
    />
  );
};
