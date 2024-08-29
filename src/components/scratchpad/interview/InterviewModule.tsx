import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import interviewPrompt from "../../../data/prompt-templates/interview.liquid?raw";
import { useTranslation } from "react-i18next";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const InterviewModule = () => {
  const { t, i18n } = useTranslation();

  return (
    <GenericModule
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={interviewPrompt}
      name="interview"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      outputTokenScaleFactor={3}
    />
  );
};
