import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
import { useTranslation } from "react-i18next";

// @ts-ignore
import proofreadingPrompt from "../../../data/prompt-templates/proofreading.liquid?raw";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const ProofreadingModule = () => {
  const { t, i18n } = useTranslation();
  return (
    <GenericModule
      placeholder="Das KI-Lektorat finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie von der KI lektorieren lassen möchten. Sie können auch einen von der KI lektorierten Text nochmals hier einfügen, und mit weiteren Instruktionen nachbearbeiten lassen."
      defaultPromptTemplate={proofreadingPrompt}
      name="proofreading"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      outputTokenScaleFactor={4}
    />
  );
};
