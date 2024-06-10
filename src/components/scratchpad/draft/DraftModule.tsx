import { atom } from "nanostores";
import { useCallback, useState } from "react";
import { MarkdownEditor } from "../../MarkdownEditor";
import { Input } from "../../../ui/input";
import { NotepadTextDashed, PenIcon } from "lucide-react";

const placeholderMarkdown = `# RedakTool

## Die KI-Browser-Extension, die man wie einen Werkzeugkasten im Web mitnimmt.



### *2024 by Aron Homberg*



* Texte, Bilder und Tabellen mit Formatierung **extrahieren** und **archivieren** (Markdown).
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

// content cache
const writerAtom = atom<string>(placeholderMarkdown);

export const DraftModule = () => {
  const [writerContent, setEditorContent] = useState<string>(writerAtom.get());

  // sync editor content with extraction
  const onWriterChange = useCallback((markdown: string) => {
    setEditorContent(markdown);
    // cache the editor content
    writerAtom.set(markdown);
  }, []);

  return (
    <div className="ab-w-fit ab-h-full ab-ml-1.5 ab-flex ab-flex-col ab-justify-between ab-items-stretch">
      <div className="ab-mb-1 ab-mt-3 ab-flex ab-flex-row ab-w-full ab-justify-between ab-items-center">
        <NotepadTextDashed className="!ab-h-6 !ab-w-6 ab-mr-2 ab-ml-2" />
        <span className="ab-text-md">Entwurf:</span>
        <Input
          defaultValue={"Unbenannt"}
          className="ab-flex !ab-ml-2 ab-w-full ab-h-8"
        />
      </div>

      <div className="ab-w-full ab-h-full ab-overflow-y-auto !ab-mr-2">
        <MarkdownEditor
          defaultValue={writerContent}
          placeholder={"Schreibe hier..."}
          name="writerEditor"
          showToolbar={true}
          onChange={onWriterChange}
        />
      </div>
      <span className="ab-flex ab-flex-row ab-p-1 ab-px-2 ab-ftr-bg ab-rounded-sm ab-items-center ab-justify-between">
        <span className="!ab-text-xs">Export</span>
        <span className="!ab-text-xs ab-mr-1">
          Zeichen: {writerContent.length}
        </span>
      </span>
    </div>
  );
};
