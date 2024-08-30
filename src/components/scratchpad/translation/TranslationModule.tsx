import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import translationPrompt from "../../../data/prompt-templates/translation.liquid?raw";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const TranslationModule = () => {
  return (
    <GenericModule
      placeholder="Die KI-Übersetzung finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie übersetzen möchten. Sie können auch eine von der KI erstellte Übersetzungen hier einfügen, die Sie mit den Instruktionen weiter nachbearbeiten können."
      defaultModelName="openai-gpt-4o"
      defaultPromptTemplate={translationPrompt}
      name="translation"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      outputTokenScaleFactor={1.2}
    />
  );
};
