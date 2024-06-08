import {
  ArrowRightCircle,
  BookCheck,
  CalendarIcon,
  CogIcon,
  CompassIcon,
  Languages,
  List,
  Mic,
  Minimize,
  Newspaper,
  PenToolIcon,
  Scale,
  SendIcon,
  User2Icon,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "../../ui/command";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
  VerticalResizeHandle,
} from "../../ui/resizable";
import { MarkdownEditor } from "../MarkdownEditor";
import {
  calculatePrompt,
  calculateTokensFromBudget,
  generatePrompt,
  type Prompt,
} from "../../lib/content-script/prompt-template";
import { Button } from "../../ui/button";
import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import {
  getScratchpadEditorContentStore,
  getTranslationEditorContentStore,
  scratchpadEditorContentAtom,
  scratchpadEditorPlaceholderMarkdown,
  scratchpadEditorPromptAtom,
  translationEditorAtom,
} from "../../lib/content-script/stores/scratchpad";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { formatCurrencyForDisplay } from "../../lib/content-script/format";
import { sendPrompt } from "../../lib/content-script/prompt";
import { AiModelDropdown } from "../AiModelDropdown";
import { useTranslation, Trans } from "react-i18next";
import { ListBulletIcon } from "@radix-ui/react-icons";

export type ToolNames =
  | "source"
  | "translation"
  | "summary"
  | "fact-check"
  | "rewrite";

export const ScratchpadLayout = () => {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState<ToolNames>("source");
  const [activeAiToolModule, setActiveAiToolModule] =
    useState<ToolNames>("translation");
  const [prompt, setPrompt] = useState<Prompt>({
    text: "",
    encoded: [],
    price: 0,
  });

  const onSetActiveAiToolModule = useCallback(
    (tool: string) => {
      setActiveAiToolModule(tool as ToolNames);
    },
    [setActiveAiToolModule],
  );

  const scratchpadEditorContent$ = getScratchpadEditorContentStore();
  const translationEditorContent$ = getTranslationEditorContentStore();
  //const [currentMarkdown, setCurrentMarkdown] = useState<string>(scratchpadEditorContent$)
  //const [textToPromptFor, setTextToPromptFor] = useState<string>("Change the ScratchPad content to re-generate the prompt")

  const onMarkdownChange = useCallback((markdown: string) => {
    console.log("markdown changed!", markdown);

    // broadcast the new markdown to the store
    scratchpadEditorContentAtom.set(markdown);

    //setTextToPromptFor(markdown)
    //setCurrentMarkdown(markdown)
  }, []);

  const onMarkdownPromptChange = useCallback((evt: any) => {
    console.log("markdown prompt changed!", evt, evt.value);

    // broadcast the new markdown to the store
    //scratchpadEditorPromptAtom.set(evt.value);
    setPrompt({
      text: evt.target.value,
      ...calculatePrompt(evt.target.value),
    } as Prompt);

    //setTextToPromptFor(markdown)
    //setCurrentMarkdown(markdown)
  }, []);

  useEffect(() => {
    setPrompt(
      generatePrompt("translation", {
        AUDIENCE: "news reader",
        CONTEXT: "Newspaper, news article, news blog, newsletter",
        MARKDOWN: scratchpadEditorContent$,
        TARGET_LANGUAGE: "English",
      }),
    );
  }, [scratchpadEditorContent$]);

  useEffect(() => {
    console.log("activeAiToolModule", activeAiToolModule);
    switch (activeAiToolModule as ToolNames) {
      case "translation":
        setPrompt(
          generatePrompt("translation", {
            AUDIENCE: "news reader",
            CONTEXT: "Newspaper, news article, news blog, newsletter",
            MARKDOWN: scratchpadEditorContent$,
            TARGET_LANGUAGE: "English",
          }),
        );
        break;
    }
  }, [activeAiToolModule]);

  useEffect(() => {
    console.log("new prompt", prompt);
  }, [prompt]);

  const onPromptSendClick = useCallback(() => {
    console.log("onPromptSendClick", prompt);

    // TODO: should be dependent on the activeAiToolModule
    setActiveView("translation");

    sendPrompt(
      prompt.text,
      (text: string) => {
        console.log("onChunk", text);

        translationEditorAtom.set(text);
      },
      (lastChunkText: string) => {
        console.log("onDone", lastChunkText);

        translationEditorAtom.set(lastChunkText);
      },
    );
  }, [prompt]);

  return (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel
        defaultSize={65}
        minSize={60}
        className="!ab-overflow-hidden"
      >
        {/*<Input defaultValue={"Unbenannt"} className="ab-m-2 ab-space-x-1" />*/}
        <Tabs
          defaultValue={activeView}
          value={activeView}
          orientation="vertical"
          className="ab-p-0 ab-m-0 ab-text-sm ab-h-full ab-flex ab-flex-col ab-items-stretch"
        >
          <TabsList className="-ab-pt-1 ab-h-12 !ab-justify-start !ab-min-h-12 ab-items-stretch">
            <TabsTrigger
              value="source"
              onClick={() => setActiveView("source")}
              className={`!ab-pt-0 !ab-max-h-9 !ab-text-md ${
                activeView === "source"
                  ? "ab-ftr-active-menu-item"
                  : "ab-ftr-menu-item"
              }`}
            >
              <Newspaper className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
              {t("module_source")}
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setActiveView("translation")}
              value="translation"
              className={`!ab-pt-0 !ab-max-h-9 !ab-text-md  ${
                activeView === "translation"
                  ? "ab-ftr-active-menu-item"
                  : "ab-ftr-menu-item"
              }`}
            >
              <Languages className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
              {t("module_translation")}
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="summary"
              className="!ab-pt-0 !ab-max-h-9 !ab-text-md "
            >
              <ListBulletIcon className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
              {t("module_summary")}
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="fact-check"
              className="!ab-pt-0 !ab-max-h-9 !ab-text-md"
            >
              <Scale className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
              {t("module_factcheck")}
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="rewrite"
              className="!ab-pt-0 !ab-max-h-9 !ab-text-md "
            >
              <BookCheck className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
              {t("module_rewrite")}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="source"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto !ab-overscroll-contain"
          >
            <MarkdownEditor
              defaultValue={scratchpadEditorContent$}
              placeholder={scratchpadEditorPlaceholderMarkdown}
              name="scratchpadEditor"
              showToolbar={true}
              onChange={onMarkdownChange}
            />
          </TabsContent>
          <TabsContent
            value="translation"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto !ab-overscroll-contain"
          >
            <MarkdownEditor
              defaultValue={translationEditorContent$}
              placeholder={""}
              name="translationEditor"
              showToolbar={true}
              onChange={() => {}}
            />
          </TabsContent>
          <TabsContent
            value="summary"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto !ab-overscroll-contain"
          >
            TODO
          </TabsContent>
          <TabsContent
            value="fact-check"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto !ab-overscroll-contain"
          >
            TODO
          </TabsContent>
          <TabsContent
            value="rewrite"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto !ab-overscroll-contain"
          >
            TODO
          </TabsContent>
        </Tabs>
      </ResizablePanel>
      <VerticalResizeHandle />
      <ResizablePanel defaultSize={35} minSize={20}>
        <ResizablePanelGroup direction="horizontal">
          <ResizablePanel defaultSize={30} minSize={10}>
            <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-sticky ab-top-0 ab-z-30 ab-justify-between">
              <h5 className="ab-font-bold ab-text-sm ab-p-1 ab-px-2]">
                KI-Werkzeuge:
              </h5>
            </div>
            <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
              <Command>
                <CommandList>
                  <CommandGroup>
                    <CommandItem
                      value="translation"
                      onSelect={onSetActiveAiToolModule}
                      className={
                        activeAiToolModule === "translation"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item"
                      }
                    >
                      <Languages className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                      <span>Übersetzen</span>
                      <CommandShortcut>⌃T</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      value="summary"
                      onSelect={onSetActiveAiToolModule}
                      className={
                        activeAiToolModule === "summary"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item"
                      }
                    >
                      <CompassIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                      <span>Zusammenfassen</span>
                      <CommandShortcut>⌃Z</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      value="fact-check"
                      onSelect={onSetActiveAiToolModule}
                      className={
                        activeAiToolModule === "fact-check"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item"
                      }
                    >
                      <List className="ab-mr-2 ab-h-5 ab-w-5 ab-shrink-0" />
                      <span>Fakten-Check</span>
                      <CommandShortcut>⌃C</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      value="rewrite"
                      onSelect={onSetActiveAiToolModule}
                      className={
                        activeAiToolModule === "rewrite"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item"
                      }
                    >
                      <PenToolIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                      <span>Neu formulieren</span>
                      <CommandShortcut>⌃N</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle className="ml-1 mr-1" />

          <ResizablePanel
            defaultSize={70}
            minSize={60}
            className="ab-h-full ab-flex ab-flex-col ab-w-full"
          >
            <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-justify-between">
              <h5 className="ab-font-bold ab-p-1 ab-px-2">
                Dynamischer KI-Prompt:
              </h5>
              <AiModelDropdown />
            </div>
            <textarea
              onChange={onMarkdownPromptChange}
              name="scratchpadPromptEditor"
              placeholder="Change the ScratchPad content to re-generate the prompt"
              value={prompt.text}
              style={{ resize: "none", marginLeft: "5px !important" }}
              className="ab-flex-1 ab-overflow-auto ab-w-full"
            />
            <div className="ab-flex ab-ftr-bg ab-flex-row ab-ml-1 ab-mr-0 ab-pr-0 ab-justify-between">
              <h5
                className="ab-font-bold ab-p-1 ab-px-2"
                style={{ fontSize: "0.9rem" }}
              >
                Kosten: {prompt.encoded.length} Token = ~
                {formatCurrencyForDisplay(prompt.price).replace(".", ",")}€;
                verbleibende Tokens:{" "}
                {formatCurrencyForDisplay(
                  calculateTokensFromBudget(20 /* USD */),
                )}
              </h5>
              <Button
                size={"sm"}
                className="ab-scale-75 ab-ftr-button ab-mr-0"
                onClick={onPromptSendClick}
              >
                <SendIcon className="ab-w-4 ab-h-4" />
                <span>Absenden</span>
              </Button>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
