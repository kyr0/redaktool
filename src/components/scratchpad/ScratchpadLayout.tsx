import {
  ArrowRightCircle,
  CalendarIcon,
  CogIcon,
  CompassIcon,
  Languages,
  List,
  Mic,
  Minimize,
  Newspaper,
  PenToolIcon,
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
import { MarkdownEditor, markdownDefaultContent } from "../MarkdownEditor";
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
import { set } from "react-hook-form";
import { Input } from "../../ui/input";

export type ToolNames =
  | "translate"
  | "summarize"
  | "fact-check"
  | "rewrite"
  | "voice-over"
  | "humanize";

export const ScratchpadLayout = () => {
  const [activeView, setActiveView] = useState<"source" | "translation">(
    "source",
  );
  const [activeAiToolModule, setActiveAiToolModule] =
    useState<ToolNames>("translate");
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
      case "translate":
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
        className="!ab-overflow-y-scroll"
      >
        {/*<Input defaultValue={"Unbenannt"} className="ab-m-2 ab-space-x-1" />*/}
        <Tabs
          defaultValue={activeView}
          value={activeView}
          orientation="vertical"
          className="ab-p-0 ab-m-0 ab-text-sm ab-h-full"
        >
          <TabsList className="ab-m-0">
            <TabsTrigger
              value="source"
              onClick={() => setActiveView("source")}
              className={`!ab-text-[12px] ${
                activeView === "source"
                  ? "ab-ftr-active-menu-item"
                  : "ab-ftr-menu-item"
              }`}
            >
              <Newspaper className="ab-w-3 ab-h-5 ab-shrink-0 ab-mr-1" />{" "}
              Content-Editor{" "}
              <ArrowRightCircle className="ab-w-3 ab-h-5 ab-shrink-0 ab-mr-1 ab-ml-1" />
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setActiveView("translation")}
              value="translation"
              className={`!ab-text-[12px] ${
                activeView === "translation"
                  ? "ab-ftr-active-menu-item"
                  : "ab-ftr-menu-item"
              }`}
            >
              <Languages className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1" />{" "}
              Übersetzt
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="summary"
              className="!ab-text-[12px] ab-opacity-45"
            >
              <CompassIcon className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1" />{" "}
              Zusammengefasst
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="evidence-findings"
              className="!ab-text-[12px] ab-opacity-45"
            >
              <List className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1" />{" "}
              Fakten-gecheckt
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="rewrite"
              className="!ab-text-[12px] ab-opacity-45"
            >
              <PenToolIcon className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1" />{" "}
              Neuformuliert
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="humanized"
              className="!ab-text-[12px] ab-opacity-45"
            >
              <PenToolIcon className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1" />{" "}
              Humanisiert
            </TabsTrigger>
          </TabsList>
          <TabsContent value="source" className="ab-m-0 ab-h-full">
            <MarkdownEditor
              defaultValue={scratchpadEditorContent$}
              placeholder={scratchpadEditorPlaceholderMarkdown}
              name="scratchpadEditor"
              showToolbar={true}
              onChange={onMarkdownChange}
            />
          </TabsContent>
          <TabsContent value="translation">
            <MarkdownEditor
              defaultValue={translationEditorContent$}
              placeholder={""}
              name="translationEditor"
              showToolbar={true}
              onChange={() => {}}
            />
          </TabsContent>
          <TabsContent value="summary">TODO</TabsContent>
          <TabsContent value="evidence-findings">TODO</TabsContent>
          <TabsContent value="rewrite">TODO</TabsContent>
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
                      value="translate"
                      onSelect={onSetActiveAiToolModule}
                      className={
                        activeAiToolModule === "translate"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item"
                      }
                    >
                      <Languages className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                      <span>Übersetzen</span>
                      <CommandShortcut>⌃T</CommandShortcut>
                    </CommandItem>
                    <CommandItem
                      value="summarize"
                      onSelect={onSetActiveAiToolModule}
                      className={
                        activeAiToolModule === "summarize"
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
                      <List className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
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
                    <CommandItem
                      value="humanize"
                      onSelect={onSetActiveAiToolModule}
                      className={
                        activeAiToolModule === "humanize"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item"
                      }
                    >
                      <User2Icon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                      <span>Humanisieren</span>
                      <CommandShortcut>⌃H</CommandShortcut>
                    </CommandItem>
                  </CommandGroup>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      value="voice-over"
                      onSelect={onSetActiveAiToolModule}
                      className={
                        activeAiToolModule === "voice-over"
                          ? "ab-ftr-active-menu-item"
                          : "ab-ftr-menu-item"
                      }
                    >
                      <Mic className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                      <span>Voice-over</span>
                      <CommandShortcut>⌃V</CommandShortcut>
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
