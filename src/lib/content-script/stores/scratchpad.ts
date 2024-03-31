import { useStore } from "@nanostores/react"
import { atom } from "nanostores"

export const scratchpadEditorPlaceholderMarkdown  = `Please select text or use the inspector to select an element in the page to prompt for, then edit the content in the editor <img src="https://hyoban.ai/logos/anwalt-de.svg" alt="drawing" width="200"/>`

export const scratchpadEditorContentAtom = atom<string>(scratchpadEditorPlaceholderMarkdown)

export const getScratchpadEditorContentStore = () => useStore(scratchpadEditorContentAtom)