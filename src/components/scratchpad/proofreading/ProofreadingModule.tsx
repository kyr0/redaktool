import { atom } from "nanostores";
import { GenericPersistentModule, type GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";
import { useTranslation } from "react-i18next";

// @ts-ignore
import proofreadingPrompt from "../../../data/prompt-templates/proofreading.liquid?raw";
import type { FC } from "react";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const ProofreadingModule: FC<GenericPersistentModuleWrapperProps> = ({ isActive }) => {
  const { t, i18n } = useTranslation();
  return (
    <GenericPersistentModule
      placeholder="Das KI-Lektorat finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie von der KI lektorieren lassen möchten. Sie können auch einen von der KI lektorierten Text nochmals hier einfügen, und mit weiteren Instruktionen nachbearbeiten lassen."
      prompt={proofreadingPrompt}
      moduleName="proofreading"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      isActive={isActive}
    />
  );
};
