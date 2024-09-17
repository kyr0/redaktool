import {
  ALargeSmall,
  BookCheck,
  FileSignature,
  Languages,
  MessageCircleDashed,
  Newspaper,
  PartyPopper,
  PenTool,
  Scale,
} from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../ui/resizable";
import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useTranslation, Trans } from "react-i18next";
import { ListBulletIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { ExtractionModule } from "./extraction/ExtractionModule";
import { MarkdownEditor } from "../MarkdownEditor";
import { atom } from "nanostores";
import { DraftModule } from "./draft/DraftModule";
import { TranslationModule } from "./translation/TranslationModule";
import { SummaryModule } from "./summary/SummaryModule";
import { CoachModule } from "./coach/CoachModule";
import { ProofreadingModule } from "./proofreading/ProofreadingModule";
import { TitlesModule } from "./titles/TitlesModule";
import { InterviewModule } from "./interview/InterviewModule";
import { db } from "../../lib/content-script/db"; // Import the db API

export type ToolName =
  | "source"
  | "translation"
  | "summary"
  | "titles"
  | "rewrite"
  | "coach"
  | "interview";

export const ScratchpadLayout = () => {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState<ToolName>();

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
        <span className="ab-h-8 ab-mr-2 ab-font-bold ab-text-lg ab-flex ab-items-center">
          Aufgabe:
        </span>
        <TabsTrigger
          value="source"
          onClick={() => setActiveView("source")}
          className={`!ab-pt-0 !ab-max-h-10 !ab-text-md ${
            activeView === "source"
              ? "ab-ftr-active-menu-item-main"
              : "ab-ftr-menu-item"
          }`}
        >
          <MagnifyingGlassIcon className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
          {t("module_source")}
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setActiveView("translation")}
          value="translation"
          className={`!ab-pt-0 !ab-max-h-10 !ab-text-md  ${
            activeView === "translation"
              ? "ab-ftr-active-menu-item-main"
              : "ab-ftr-menu-item"
          }`}
        >
          <Languages className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
          {t("module_translation")}
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setActiveView("summary")}
          value="summary"
          className={`!ab-pt-0 !ab-max-h-10 !ab-text-md  ${
            activeView === "summary"
              ? "ab-ftr-active-menu-item-main"
              : "ab-ftr-menu-item"
          }`}
        >
          <ListBulletIcon className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
          {t("module_summary")}
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setActiveView("coach")}
          value="coach"
          className={`!ab-pt-0 !ab-max-h-10 !ab-text-md  ${
            activeView === "coach"
              ? "ab-ftr-active-menu-item-main"
              : "ab-ftr-menu-item"
          }`}
        >
          <PenTool className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
          Schreib-Coach
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setActiveView("rewrite")}
          value="rewrite"
          className={`!ab-pt-0 !ab-max-h-10 !ab-text-md  ${
            activeView === "rewrite"
              ? "ab-ftr-active-menu-item-main"
              : "ab-ftr-menu-item"
          }`}
        >
          <BookCheck className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
          {t("module_rewrite")}
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setActiveView("titles")}
          value="titles"
          className={`!ab-pt-0 !ab-max-h-10 !ab-text-md  ${
            activeView === "titles"
              ? "ab-ftr-active-menu-item-main"
              : "ab-ftr-menu-item"
          }`}
        >
          <ALargeSmall className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
          {t("module_titles")}
        </TabsTrigger>
        <TabsTrigger
          onClick={() => setActiveView("interview")}
          value="interview"
          className={`!ab-pt-0 !ab-max-h-10 !ab-text-md  ${
            activeView === "interview"
              ? "ab-ftr-active-menu-item-main"
              : "ab-ftr-menu-item"
          }`}
        >
          <MessageCircleDashed className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
          {t("module_interview")}
        </TabsTrigger>
      </TabsList>
      <TabsContent
        forceMount
        hidden={activeView !== "source"}
        value="source"
        className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
      >
        <ExtractionModule isActive={activeView === "source"} />
      </TabsContent>
      <TabsContent
        forceMount
        hidden={activeView !== "translation"}
        value="translation"
        className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
      >
        <TranslationModule isActive={activeView === "translation"} />
      </TabsContent>
      <TabsContent
        forceMount
        hidden={activeView !== "summary"}
        value="summary"
        className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
      >
        <SummaryModule isActive={activeView === "summary"} />
      </TabsContent>

      <TabsContent
        forceMount
        hidden={activeView !== "coach"}
        value="coach"
        className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
      >
        <CoachModule isActive={activeView === "coach"} />
      </TabsContent>
      <TabsContent
        forceMount
        hidden={activeView !== "rewrite"}
        value="rewrite"
        className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
      >
        <ProofreadingModule isActive={activeView === "rewrite"} />
      </TabsContent>
      <TabsContent
        forceMount
        hidden={activeView !== "titles"}
        value="titles"
        className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
      >
        <TitlesModule isActive={activeView === "titles"} />
      </TabsContent>
      <TabsContent
        forceMount
        hidden={activeView !== "interview"}
        value="interview"
        className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
      >
        <InterviewModule isActive={activeView === "interview"} />
      </TabsContent>
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
