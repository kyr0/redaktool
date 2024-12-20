import { atom } from "nanostores";
// @ts-ignore
import extractionPrompt from "../../../data/prompt-templates/extraction.liquid?raw";
import { memo, useCallback, useEffect, useState, type FC } from "react";
import { GenericPersistentModule, type GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";

const editorAtom = atom<string>("");
const inputEditorAtom = atom<string>("");
//const autoExtractAtom = atom<string>("");

export const ExtractionModule: FC<GenericPersistentModuleWrapperProps> = memo(({ isActive }) => {

  /*
  const extractedWebsiteData$ = useStore(extractedWebsiteDataAtom);
  const [editorContent, setEditorContent] = useState<string>(editorAtom.get());
  const [inputEditorContent, setInputEditorContent] = useState<string>(
    inputEditorAtom.get(),
  );
  const [editorEl, setEditorEl] = useState<HTMLElement | null>(null);
  const [inputEditorEl, setInputEditorEl] = useState<HTMLElement | null>(null);
  const [editorArgs, setEditorArgs] = useState<MilkdownEditorCreatedArgs>();
  const [inputEditorArgs, setInputEditorArgs] =
    useState<MilkdownEditorCreatedArgs>();
  const [hasLoadedContent, setHasLoadedContent] = useState(false);
  const [hasLoadedInputContent, setHasLoadedInputContent] = useState(false);

  */
  console.log("rerender ExtractionModule");

  // auto-extract content
  /*
  useEffect(() => {
    console.log("auto-extract existing!!", autoExtractAtom.get());

    const extractedWebsiteData = autoExtractAtom.get();

    // only if no content is present
    if (extractedWebsiteData?.length && extractedWebsiteData.length > 0) {
      return;
    }

    const { bestCandidate } = autoCorrelateMostRelevantContent(
      document,
      document.body,
    );

    if (bestCandidate?.node) {
      const markdown = turndown(
        cloneAndFilterNode(bestCandidate.node as HTMLElement),
      );

      console.log("markdown", markdown);

      autoExtractAtom.set(markdown);

      setEditorContent(markdown);
    } else {
      console.error("No best candidate found");
    }
  }, []);
  */

  /*
  const debouncedAppendToEditor = useDebouncedCallback(
    useCallback(
      ({ content }) => {
        setEditorContent((editorContent) =>
          editorContent.trim() ? `${editorContent}\n---\n${content}` : content,
        );
        scrollDownMax(editorEl);
      },
      [editorEl],
    ),
    100,
    { maxWait: 200 },
  );

  const debouncedAppendToInputEditor = useDebouncedCallback(
    useCallback(
      ({ content }) => {
        console.log("debouncedAppendToInputEditor", content);

        setInputEditorContent((inputEditorContent) =>
          inputEditorContent.trim()
            ? `${inputEditorContent}\n\n${content}`
            : content,
        );

        console.log("debouncedAppendToInputEditor", content);

        scrollDownMax(inputEditorEl);
      },
      [inputEditorEl],
    ),
    100,
    { maxWait: 200 },
  );

  // sync extraction with editor content
  useEffect(() => {
    if (extractedWebsiteData$ && !hasLoadedContent) {
      console.log("setting extracted input", extractedWebsiteData$);
      debouncedAppendToInputEditor({ content: extractedWebsiteData$ });
      extractedWebsiteDataAtom.set(""); // reset buffer
      setHasLoadedContent(true);
    } else if (
      editorArgs &&
      editorArgs.getValue!().length === 0 &&
      !hasLoadedContent
    ) {
      (async () => {
        const content = await outputDbState.get();
        if (content) {
          debouncedAppendToEditor({ content });
        } else {
          // set placeholder content
          setEditorContent("");
        }
        setHasLoadedContent(true);
      })();
    }
  }, [extractedWebsiteData$, editorArgs, hasLoadedContent]);

  useEffect(() => {
    if (
      inputEditorArgs &&
      inputEditorArgs.getValue!().length === 0 &&
      !hasLoadedInputContent
    ) {
      (async () => {
        console.log("inputEditorArgs change");
        const content = await inputDbState.get();
        if (content) {
          debouncedAppendToInputEditor({ content });
        } else {
          // set placeholder content
          setEditorContent("");
        }
        setHasLoadedInputContent(true);
      })();
    }
  }, [inputEditorArgs, hasLoadedInputContent]);

  const onEditorContentChange = useCallback(
    (markdown: string) => {
      console.log("onEditorContentChange", markdown);
      setEditorContent(markdown);
      if (editorArgs) {
        outputDbState.set(markdown);
      }
    },
    [editorArgs],
  );

  const onInputEditorContentChange = useCallback(
    (markdown: string) => {
      console.log("onInputEditorContentChange", markdown);
      setInputEditorContent(markdown);
      if (inputEditorArgs) {
        inputDbState.set(markdown);
      }
    },
    [inputEditorArgs],
  );

  const onEditorCreated = useCallback(({ args }: CallbackArgs) => {
    setEditorEl(args.el);
    setEditorArgs(args);
  }, []);

  const onInputEditorCreated = useCallback(({ args }: CallbackArgs) => {
    setInputEditorEl(args.el);
    setInputEditorArgs(args);
  }, []);

  return (
    <GenericModule
      value={editorContent}
      inputValue={inputEditorContent}
      placeholder="Die KI-Analyse und Zusammenfasstung finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie analysieren und zusammenfassen möchten. Sie können auch eine von der KI erstellte Analyse/Zusammenfassung hier einfügen, die Sie mit den Instruktionen weiter nachbearbeiten können."
      defaultPromptTemplate={extractionPrompt}
      name={moduleName}
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      onEditorContentChange={onEditorContentChange}
      onInputEditorContentChange={onInputEditorContentChange}
      onEditorCreated={onEditorCreated}
      onInputEditorCreated={onInputEditorCreated}

    />
  );
  */

  return (
    <GenericPersistentModule
      placeholder="Die KI-Analyse und Zusammenfasstung finden Sie hier, sobald Sie Ihren Text eingegeben und die KI-Verarbeitung mit dem Senden-Button gestartet haben."
      inputPlaceholder="Geben Sie hier den Text ein, den Sie analysieren und zusammenfassen möchten. Sie können auch eine von der KI erstellte Analyse/Zusammenfassung hier einfügen, die Sie mit den Instruktionen weiter nachbearbeiten können."
      prompt={extractionPrompt}
      moduleName="extraction"
      editorAtom={editorAtom}
      inputEditorAtom={inputEditorAtom}
      isActive={isActive}
    />
  );
});
