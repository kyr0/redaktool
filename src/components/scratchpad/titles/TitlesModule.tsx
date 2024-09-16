import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
// @ts-ignore
import titlesPrompt from "../../../data/prompt-templates/titles.liquid?raw";
import { useTranslation } from "react-i18next";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const TitlesModule = () => {
  const { t, i18n } = useTranslation();

  return (
    <GenericModule
      placeholder="Titelvorschläge finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, zu dem Sie Titelvorschläge erhaltrn möchten. Sie können auch eine von der KI erstellte Titelvorschläge hier einfügen, die Sie mit den Instruktionen weiter nachbearbeiten können."
      defaultPromptTemplate={titlesPrompt}
      name="titles"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      outputTokenScaleFactor={0.1}
    />
  );
};
