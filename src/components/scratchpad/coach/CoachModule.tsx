import { atom } from "nanostores";
import { GenericPersistentModule, type GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";
// @ts-ignore
import coachPrompt from "../../../data/prompt-templates/coach.liquid?raw";
import { useTranslation } from "react-i18next";
import type { FC } from "react";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const CoachModule: FC<GenericPersistentModuleWrapperProps> = ({ isActive }) => {
  const { t, i18n } = useTranslation();

  return (
    <GenericPersistentModule
      placeholder="Die Schreibcoach-Hinweise finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, zu dem Sie Hinweise erhalten möchten. Sie können auch von der KI verbesserten Text hier einfügen, um ihn mit weiteren Instruktionen nachbearbeiten zu lassen."
      prompt={coachPrompt}
      moduleName="coach"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      isActive={isActive}
    />
  );
};
