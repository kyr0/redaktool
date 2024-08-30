import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import coachPrompt from "../../../data/prompt-templates/coach.liquid?raw";
import { useTranslation } from "react-i18next";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const CoachModule = () => {
  const { t, i18n } = useTranslation();

  return (
    <GenericModule
      placeholder="Die Schreibcoach-Hinweise finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, zu dem Sie Hinweise erhalten möchten. Sie können auch von der KI verbesserten Text hier einfügen, um ihn mit weiteren Instruktionen nachbearbeiten zu lassen."
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={coachPrompt}
      name="coach"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      outputTokenScaleFactor={4}
    />
  );
};
