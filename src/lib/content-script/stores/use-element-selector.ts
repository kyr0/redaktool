import { useStore } from "@nanostores/react";
import { atom } from "nanostores";

// @ts-ignore
export const elementSelectionAtom = atom<Element | Text>();

export const getElementSelectionStore = () => useStore(elementSelectionAtom);
