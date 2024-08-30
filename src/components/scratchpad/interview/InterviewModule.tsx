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
      placeholder="Einen Vorschlag für das Interview finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier die Background-Info's für die Interview-Vorbereitung ein. Das sollten die selben Informationen sein, die Sie sonst auch zur Vorbereitung verwenden. Sie können auch einen von der KI erstellten Interview-Vorschlag hier einfügen, den Sie mit den Instruktionen weiter nachbearbeiten können."
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={interviewPrompt}
      name="interview"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      outputTokenScaleFactor={3}
    />
  );
};
