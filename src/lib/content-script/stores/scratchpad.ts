import { useStore } from "@nanostores/react";
import { atom } from "nanostores";

export const scratchpadEditorPlaceholderMarkdown = "";

export const scratchpadEditorContentAtom = atom<string>(
  scratchpadEditorPlaceholderMarkdown,
);
export const getScratchpadEditorContentStore = () =>
  useStore(scratchpadEditorContentAtom);

export const scratchpadEditorPromptAtom = atom<string>("Prompt here");
export const getScratchpadEditorPromptStore = () =>
  useStore(scratchpadEditorPromptAtom);

export const translationEditorAtom = atom<string>("");
export const getTranslationEditorContentStore = () =>
  useStore(translationEditorAtom);
