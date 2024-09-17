import { atom } from "nanostores";
import { GenericPersistentModule, type GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";
// @ts-ignore
import translationPrompt from "../../../data/prompt-templates/translation.liquid?raw";
import type { FC } from "react";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const TranslationModule: FC<GenericPersistentModuleWrapperProps> = ({ isActive }) => {
  return (
    <GenericPersistentModule
      placeholder="Die KI-Übersetzung finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie übersetzen möchten. Sie können auch eine von der KI erstellte Übersetzungen hier einfügen, die Sie mit den Instruktionen weiter nachbearbeiten können."
      prompt={translationPrompt}
      moduleName="translation"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      isActive={isActive}
    />
  );
};
