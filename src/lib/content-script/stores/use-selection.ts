import { useStore } from "@nanostores/react"
import { atom } from "nanostores"

export interface TrackedSelection {
    selection: Selection,
    text: string,
    element: Element,
    markdown: string,
}

// atom to keep track of the current selection and deselection whereever it happens on the page
export const selectionAtom = atom<TrackedSelection | null>(null)

// atom to keep track when a new selection is made, but only when text and range are not empty
// @ts-ignore
export const selectionGuaranteedAtom = atom<TrackedSelection>()

// atom to keep track of selections that are not empty and happened outside of the own dialog
// @ts-ignore
export const guardedSelectionGuaranteedAtom = atom<TrackedSelection>()

export const getSelectionStore = () => useStore(selectionAtom)
export const getSelectionGuaranteedStore = () => useStore(selectionGuaranteedAtom)
export const getGuardedSelectionGuaranteedStore = () => useStore(guardedSelectionGuaranteedAtom)
