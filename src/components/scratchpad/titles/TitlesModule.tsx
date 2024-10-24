import { atom } from "nanostores";
import { GenericPersistentModule, type GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";
// @ts-ignore
import titlesPrompt from "../../../data/prompt-templates/titles.liquid?raw";
import { useTranslation } from "react-i18next";
import type { FC } from "react";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const TitlesModule: FC<GenericPersistentModuleWrapperProps> = ({ isActive }) => {
  const { t, i18n } = useTranslation();

  return (
    <GenericPersistentModule
      placeholder="Titelvorschläge finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, zu dem Sie Titelvorschläge erhaltrn möchten. Sie können auch eine von der KI erstellte Titelvorschläge hier einfügen, die Sie mit den Instruktionen weiter nachbearbeiten können."
      prompt={titlesPrompt}
      moduleName="titles"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      isActive={isActive}
    />
  );
};
