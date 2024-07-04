import { atom } from "nanostores";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MarkdownEditor,
  type MilkdownEditorCreatedArgs,
} from "../../MarkdownEditor";
import { Input } from "../../../ui/input";
import { NotepadTextDashed, PenIcon } from "lucide-react";
import { db } from "../../../lib/content-script/db";

const placeholderMarkdown = `# RedakTool

## Die KI-Browser-Extension, die man wie einen Werkzeugkasten im Web mitnimmt.

### *2024 by Aron Homberg*

* Texte, Bilder und Tabellen mit Formatierung **extrahieren** und **archivieren** (Markdown, HTML, JSON).
* KI-**Übersetzung**, die Metaphern, den Sprachstil und die Zielgruppe berücksichtigt.
* KI-**Zusammenfassung**, die wahlweise nach **Bedeutung** oder **Chronologie** arbeitet (z.B. für Interviews).
* KI-**Formulierungshilfe**, die den **menschlichen Touch** und den **eigenen Stil** simuliert.
* KI-**Titelvorschläge** in vielen verschiedenen Stilen.
* KI-**Transkription**, die **Audio**- und **Video** auf Webseiten erkennt und nahezu fehlerfrei in Echtzeit arbeitet.
* Funktioniert (bald) mit fast **allen KI-Modellen** - auch **Open Source**-Modellen und **lokal** betriebenen Modellen (z. B. mittels Ollama).`;

// content cache
const writerAtom = atom<string>("Loading...");

export const DraftModule = () => {
  const [writerContent, setEditorContent] = useState<string>(writerAtom.get());

  const { get, set } = useMemo(() => db<string>("draft"), []);

  useEffect(() => {
    (async () => {
      // read initially from db
      const markdown = await get();
      console.log("DraftModule: markdown loaded", markdown);
      setEditorContent(markdown || placeholderMarkdown);
      writerAtom.set(markdown || placeholderMarkdown);
    })();
  }, [get, writerAtom, setEditorContent]);

  // sync editor content with extraction
  const onWriterChange = useCallback(
    (markdown: string) => {
      setEditorContent(markdown);

      // save to db
      set(markdown);

      // cache the editor content
      writerAtom.set(markdown);
    },
    [set],
  );

  const onEditorCreated = useCallback(
    ({ getValue, setValue }: MilkdownEditorCreatedArgs) => {
      //console.log("onEditorCreated getValue", getValue!());

      const checkTabActiveInterval = setInterval(async () => {
        // update the content, may be changed in other tabs, when inactive
        if (document.hidden) {
          console.log("tab is inactive");
          try {
            const markdown = await get();
            setValue!(markdown);
            // cache the editor content
            writerAtom.set(markdown);
            setEditorContent(markdown);
          } catch (e) {
            // ignore
          }
          return;
        }
      }, 50);
      return () => {
        clearInterval(checkTabActiveInterval);
      };
    },
    [writerAtom],
  );

  return (
    <div className="ab-w-full ab-h-full ab-pl-1.5 ab-flex ab-flex-col ab-justify-between ab-items-stretch">
      <div className="ab-mb-1 ab-mt-3 ab-flex ab-flex-row ab-w-full ab-justify-between ab-items-center">
        <span className="ab-text-md ab-w-fit ab-whitespace-nowrap ab-break-keep">
          Titel:
        </span>
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
          onCreated={onEditorCreated}
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
