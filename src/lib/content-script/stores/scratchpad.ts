import { useStore } from "@nanostores/react";
import { atom } from "nanostores";

export const scratchpadEditorPlaceholderMarkdown = `# RedakTool

## Die KI-Browser-Extension, die man wie einen Werkzeugkasten im Web mitnimmt.



### *2024 by Aron Homberg*



* Texte, Bilder und Tabellen mit Formatierung **extrahieren** und **archivieren **(Markdown).
* KI-**Übersetzung**, die Metaphern versteht, den Sprachstil und die Zielgruppe berücksichtigt.
* KI-**Zusammenfassung**, die wahlweise nach **Bedeutung** oder **Chronologie** arbeitet (Interviews).
* KI-**Faktencheck**, der erstaunlich **wenig halluziniert**.
* KI-**Formulierungshilfe**, die den **menschlichen Touch** und den **eigenen Stil** simuliert.&#x20;
* KI-**Transkription**, die **Audio**- und **Video** auf Webseiten erkennt und nahezu fehlerfrei in Echtzeit arbeitet.

|    |    |    |    |
| :- | :- | :- | :- |
|    |    |    |    |
|    |    |    |    |
`;

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
