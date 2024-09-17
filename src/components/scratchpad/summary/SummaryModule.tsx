import { atom } from "nanostores";
import { GenericPersistentModule, type GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";
// @ts-ignore
import summaryPrompt from "../../../data/prompt-templates/summary.liquid?raw";
import { useTranslation } from "react-i18next";
import type { FC } from "react";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const SummaryModule: FC<GenericPersistentModuleWrapperProps> = ({ isActive }) => {
  const { t, i18n } = useTranslation();

  return (
    <GenericPersistentModule
      placeholder="Die KI-Analyse und Zusammenfasstung finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie analysieren und zusammenfassen möchten. Sie können auch eine von der KI erstellte Zusammenfassung hier einfügen, die Sie mit den Instruktionen weiter nachbearbeiten können."
      prompt={summaryPrompt}
      moduleName="summary"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      isActive={isActive}
    />
  );
};
