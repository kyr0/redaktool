import { atom } from "nanostores";
import { GenericPersistentModule, type GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";
// @ts-ignore
import interviewPrompt from "../../../data/prompt-templates/interview.liquid?raw";
import { useTranslation } from "react-i18next";
import { memo, type FC } from "react";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");

export const InterviewModule: FC<GenericPersistentModuleWrapperProps> = memo(({ isActive }) => {
  const { t, i18n } = useTranslation();

  return (
    <GenericPersistentModule
      placeholder="Einen Vorschlag für das Interview finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier die Background-Info's für die Interview-Vorbereitung ein. Das sollten die selben Informationen sein, die Sie sonst auch zur Vorbereitung verwenden. Sie können auch einen von der KI erstellten Interview-Vorschlag hier einfügen, den Sie mit den Instruktionen weiter nachbearbeiten können."
      prompt={interviewPrompt}
      moduleName="interview"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      isActive={isActive}
    />
  );
});
