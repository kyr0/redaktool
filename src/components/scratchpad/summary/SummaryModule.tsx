import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import summaryPrompt from "../../../data/prompt-templates/summary.liquid?raw";
import { useTranslation } from "react-i18next";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const SummaryModule = () => {
  const { t, i18n } = useTranslation();

  return (
    <GenericModule
      placeholder="Die KI-Analyse und Zusammenfasstung finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie analysieren und zusammenfassen möchten. Sie können auch eine von der KI erstellte Zusammenfassung hier einfügen, die Sie mit den Instruktionen weiter nachbearbeiten können."
      defaultPromptTemplate={summaryPrompt}
      name="summary"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      outputTokenScaleFactor={0.2}
    />
  );
};
