import {
  ALargeSmall,
  BookCheck,
  FileSignature,
  Languages,
  MessageCircleDashed,
  Newspaper,
  PartyPopper,
  PenIcon,
  PenTool,
  PlusIcon,
  Scale,
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState, type FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useTranslation, Trans } from "react-i18next";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { ExtractionModule } from "./extraction/ExtractionModule";
import { TranslationModule } from "./translation/TranslationModule";
import { CoachModule } from "./coach/CoachModule";
import { ProofreadingModule } from "./proofreading/ProofreadingModule";
import { TitlesModule } from "./titles/TitlesModule";
import { InterviewModule } from "./interview/InterviewModule";
import { ProseModule } from "./prose/ProseModule";
import { db } from "../../lib/content-script/db"; // Import the db API
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import type { GenericPersistentModuleWrapperProps } from "./GenericPersistentModule";

export type ToolName =
  | "prose"
  | "source"
  | "translation"
  | "titles"
  | "rewrite"
  | "coach"
  | "interview"
  | "community";

export interface TextTool {
  name: ToolName;
  label: string;
  icon: React.ReactNode;
  closed: boolean;
  closable: boolean;
  module: FC<GenericPersistentModuleWrapperProps>;
}

export const ScratchpadLayout = () => {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState<ToolName>("prose");
  const [tools, setTools] = useState<Array<TextTool>>([{
      name: "prose",
      label: "Prosa",
      closable: true,
      closed: false,
      icon: <PenIcon className="ab-shrink-0 ab-w-4 ab-h-4" />,
      module: ProseModule
    }, {
      name: "source",
      label: "Zusammenfassung",
      closable: true,
      closed: false,
      icon: <MagnifyingGlassIcon className="ab-shrink-0 ab-w-4 ab-h-4" />,
      module: ExtractionModule
    }, {
      name: "translation",
      label: "Übersetzung",
      closable: true,
      closed: false,
      icon: <Languages className="ab-shrink-0 ab-w-4 ab-h-4" />,
      module: TranslationModule
    }, {
      name: "coach",
      closable: true,
      closed: false,
      label: "Schreib-Coach",
      icon: <PenTool className="ab-shrink-0 ab-w-4 ab-h-4" />,
      module: CoachModule
    }, {
      name: "rewrite",
      label: "Lektorat",
      closable: true,
      closed: false,
      icon: <BookCheck className="ab-shrink-0 ab-w-4 ab-h-4" />,
      module: ProofreadingModule
    }, {
      name: "titles",
      label: "Titel",
      closable: true,
      closed: true,
      icon: <ALargeSmall className="ab-shrink-0 ab-w-4 ab-h-4" />,
      module: TitlesModule
    }, {
      name: "interview",
      label: "Interview",
      closable: true,
      closed: true,
      icon: <MessageCircleDashed className="ab-shrink-0 ab-w-4 ab-h-4" />,
      module: InterviewModule
    }, {
      name: "community",
      closable: false,
      closed: false,
      label: "",
      icon: <PlusIcon className="ab-shrink-0 ab-h-6 ab-w-6" />,
      module: () => <div>TODO: Community</div>
    }
  ]);

  // TODO: store/restore closed state of tools

  // Load the last active view from the database
  useEffect(() => {
    const loadLastActiveView = async () => {
      const lastActiveView = await db("lastActiveView").get();
      if (lastActiveView) {
        setActiveView(lastActiveView as ToolName);
      }
    };
    loadLastActiveView();
  }, []);

  const onCloseTab = useCallback((tab: ToolName) => {
    console.log("close tab", tab);
    const newTools = tools.map((tool) => {
      if (tool.name === tab) {
        return {
          ...tool,
          closed: true,
        };
      }
      return tool;
    });
    console.log("newTools", newTools);
    setTools(newTools);
  }, [tools]);

  useEffect(() => {
    console.log("activeView", activeView);
    // find the name of the first open tab
    const firstOpenTab = tools.find((tool) => !tool.closed)?.name;
    console.log("firstOpenTab", firstOpenTab || "community");
    setActiveView(firstOpenTab || "community");
  }, [tools]);

  // Save the active view to the database whenever it changes
  useEffect(() => {
    db("lastActiveView").set(activeView);
  }, [activeView]);


  return (
    <Tabs
      defaultValue={activeView}
      value={activeView}
      orientation="vertical"
      className="ab-p-0 ab-m-0 ab-mx-1.5 ab-text-sm ab-h-full ab-flex ab-flex-col ab-items-stretch"
    >
      <TabsList className="-ab-pt-1 ab-h-12 !ab-justify-start !ab-min-h-12 ab-items-stretch ab-transparent">
        <span className="ab-h-8 ab-mr-2 ab-font-bold ab-text-md ab-flex ab-items-center">
          Prompt:
        </span>

        {tools.map((tool) => (
          <TabsTrigger
            key={tool.name + Math.random()*10000}
            value={tool.name}
            onClick={() => setActiveView(tool.name)}
            className={`!ab-pt-0 !ab-max-h-10 !ab-text-md !ab-px-1 ${
              activeView === tool.name
                ? "ab-ftr-active-menu-item-main"
                : "ab-ftr-menu-item"
            } ${tool.closed ? 'ab-hidden' : ''} !ab-shadow-none !ab-border-none `}
          >
            {tool.name === "community" && (<Separator orientation="vertical" className="!ab-h-4 !ab-mr-2 !-ab-ml-0"/>)}
            {tool.icon} 
            <span className={`ab-ml-1 ${activeView === tool.name ? 'ab-font-bold' : ''}`}>
              {tool.label} 
            </span>
            {tool.closable && (
              <Button variant={"ghost"} size={"sm"} className="!ab-w-6 !ab-h-6 !ab-ml-1 !ab-p-0 !ab-shrink-0 !ab-rounded-full" onClick={() => onCloseTab(tool.name)}>
                <XIcon className="!ab-shrink-0 ab-w-4 ab-h-4" />
              </Button>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tools.map((tool) => (
        <TabsContent
          forceMount
          hidden={activeView !== tool.name}
          value={tool.name}
          key={tool.name}
          className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
        >
          <tool.module isActive={activeView === tool.name} />
        </TabsContent>
      ))}
    </Tabs>
  );
};

// {/*
// <ResizablePanelGroup direction="horizontal">
//   <ResizablePanel defaultSize={55} minSize={20}>
//     */}

//   {/*
//   </ResizablePanel>
//   */}
//   {/*
//   <ResizableHandle />
//   <ResizablePanel defaultSize={45} minSize={20}>
//     <DraftModule />
//   </ResizablePanel>
// </ResizablePanelGroup>
//   */}
