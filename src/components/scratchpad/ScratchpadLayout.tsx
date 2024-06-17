import { BookCheck, Languages, Newspaper, Scale } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../ui/resizable";
import { useCallback, useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useTranslation, Trans } from "react-i18next";
import { ListBulletIcon } from "@radix-ui/react-icons";
import { ExtractionModule } from "./extraction/ExtractionModule";
import { MarkdownEditor } from "../MarkdownEditor";
import { atom } from "nanostores";
import { DraftModule } from "./draft/DraftModule";
import { TranslationModule } from "./translation/TranslationModule";
import { SummaryModule } from "./summary/SummaryModule";
import { CoachModule } from "./coach/CoachModule";
import { ProofreadingModule } from "./proofreading/ProofreadingModule";

export type ToolNames =
  | "source"
  | "translation"
  | "summary"
  | "fact-check"
  | "rewrite"
  | "coach";

export const ScratchpadLayout = () => {
  const { t, i18n } = useTranslation();
  const [activeView, setActiveView] = useState<ToolNames>("source");

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={55} minSize={20}>
        <Tabs
          defaultValue={activeView}
          value={activeView}
          orientation="vertical"
          className="ab-p-0 ab-m-0 ab-mx-1.5 ab-text-sm ab-h-full ab-flex ab-flex-col ab-items-stretch"
        >
          <TabsList className="-ab-pt-1 ab-h-12 !ab-justify-start !ab-min-h-12 ab-items-stretch ab-bg-transparent">
            <TabsTrigger
              value="source"
              onClick={() => setActiveView("source")}
              className={`!ab-pt-0 !ab-max-h-10 !ab-text-md ${
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
              className={`!ab-pt-0 !ab-max-h-10 !ab-text-md  ${
                activeView === "translation"
                  ? "ab-ftr-active-menu-item"
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
                  ? "ab-ftr-active-menu-item"
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
                  ? "ab-ftr-active-menu-item"
                  : "ab-ftr-menu-item"
              }`}
            >
              <BookCheck className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
              Creative Writing
            </TabsTrigger>
            <TabsTrigger
              onClick={() => setActiveView("rewrite")}
              value="rewrite"
              className={`!ab-pt-0 !ab-max-h-10 !ab-text-md  ${
                activeView === "rewrite"
                  ? "ab-ftr-active-menu-item"
                  : "ab-ftr-menu-item"
              }`}
            >
              <BookCheck className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
              {t("module_rewrite")}
            </TabsTrigger>
            <TabsTrigger
              disabled
              value="fact-check"
              className="!ab-pt-0 !ab-max-h-10 !ab-text-md"
            >
              <Scale className="ab-w-4 ab-h-4 ab-shrink-0 ab-mr-1" />{" "}
              {t("module_factcheck")}
            </TabsTrigger>
          </TabsList>
          <TabsContent
            value="source"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
          >
            <ExtractionModule />
          </TabsContent>
          <TabsContent
            value="translation"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
          >
            <TranslationModule />
          </TabsContent>
          <TabsContent
            value="summary"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
          >
            <SummaryModule />
          </TabsContent>

          <TabsContent
            value="coach"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
          >
            <CoachModule />
          </TabsContent>
          <TabsContent
            value="fact-check"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
          >
            TODO
          </TabsContent>
          <TabsContent
            value="rewrite"
            className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
          >
            <ProofreadingModule />
          </TabsContent>
        </Tabs>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={45} minSize={20}>
        <DraftModule />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
