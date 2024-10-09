import { atom } from "nanostores";
import { GenericPersistentModule, type GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";
// @ts-ignore
import prosePrompt from "../../../data/prompt-templates/prose.liquid?raw";
import { useTranslation } from "react-i18next";
import type { FC } from "react";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const ProseModule: FC<GenericPersistentModuleWrapperProps> = ({ isActive }) => {
  const { t, i18n } = useTranslation();

  console.log("prose is active", isActive);

  return (
    <GenericPersistentModule
      placeholder="Das Ergbnis finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie als Kontext geben möchten, um einen beliebigen Text erstellen zu lassen. Sie können links unter 'Einstellungen' das Ergebnis verfeinern. Unter Instruktionen können Sie Anweisungen im Freitext festlegen."
      prompt={prosePrompt}
      moduleName="prose"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      isActive={isActive}
    />
  );
};
