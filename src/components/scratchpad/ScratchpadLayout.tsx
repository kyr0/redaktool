import {
  XIcon,
} from "lucide-react";
import { useCallback, useEffect, useState, type FC } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import { useTranslation, Trans } from "react-i18next";
import { db } from "../../lib/content-script/db"; // Import the db API
import { Button } from "../../ui/button";
import { Separator } from "../../ui/separator";
import { liveToolsStateAtom, DEFAULT_TOOLS_ACTIVE, type ToolName, BUILTIN_TOOLS, type TextTool, liveActiveToolAtom, toolsStateDb, lastActiveViewDb } from "./state";
import { useStore } from "@nanostores/react";

export const ScratchpadLayout = () => {
  const { t, i18n } = useTranslation();
  const activeViewStore = useStore(liveActiveToolAtom);
  const activeToolNamesStore = useStore(liveToolsStateAtom);
  const [tools, setTools] = useState<Array<TextTool>>([]);
  const [tabClosed, setTabClosed] = useState(false); // state to track if a tab has been closed

  useEffect(() => {
    const loadToolsState = async () => {
      const storedToolsState = await toolsStateDb.get();
      liveToolsStateAtom.set(storedToolsState || DEFAULT_TOOLS_ACTIVE);
    };
    loadToolsState();
  }, []);

  useEffect(() => {
    const newTools = BUILTIN_TOOLS.filter(tool => activeToolNamesStore.includes(tool.name));
    setTools(newTools);
  }, [activeToolNamesStore]);

  // Load the last active view from the database
  useEffect(() => {
    const loadLastActiveView = async () => {
      const lastActiveView = await lastActiveViewDb.get();
      if (lastActiveView) {
        console.log("load last active view", lastActiveView);
        liveActiveToolAtom.set(lastActiveView as ToolName);
      } else {
        liveActiveToolAtom.set(tools.filter(tool => !tool.closed)![0].name); // first one that isn't closed
      }
    };
    loadLastActiveView();
  }, [tools]);

  useEffect(() => {
    if (!tabClosed) { // only execute the logic if a tab has been closed
      return;
    }
    const activeTool = tools.find(tool => tool.name === activeViewStore);
    
    if (!activeTool || activeTool.closed) {
      const activeToolIndex = tools.findIndex(tool => tool.name === activeViewStore);
      if (activeToolIndex > 0) {
        const leftTool = tools[activeToolIndex - 1];
        if (!leftTool.closed) {
          liveActiveToolAtom.set(leftTool.name);
          lastActiveViewDb.set(leftTool.name);
        }
      } else {
        const firstOpenTool = tools.find(tool => !tool.closed);
        if (firstOpenTool) {
          liveActiveToolAtom.set(firstOpenTool.name);
          lastActiveViewDb.set(firstOpenTool.name);
        }
      }
      setTabClosed(false); // reset the state after handling
    }
  }, [activeViewStore, tools, tabClosed]);

  const onCloseTab = useCallback((tab: ToolName) => {
    const newTools = tools.map((tool) => {
      if (tool.name === tab) {
        return {
          ...tool,
          closed: true,
        };
      }
      return tool;
    });
    setTools(newTools);
    const updatedToolsState = newTools.filter(tool => !tool.closed).map(tool => tool.name);
    liveToolsStateAtom.set(updatedToolsState);
    toolsStateDb.set(updatedToolsState);
    setTabClosed(true); // set the state to true when a tab is closed
  }, [tools]);

  // Sync the active view with the database whenever it changes
  useEffect(() => {
    if (activeViewStore !== null) {
      db("lastActiveView").set(activeViewStore);
    }
  }, [activeViewStore]);

  return (
    <Tabs
      defaultValue={activeViewStore || "community"}
      value={activeViewStore || "community"}
      orientation="vertical"
      className="ab-p-0 ab-m-0 ab-mx-1.5 ab-text-sm ab-h-full ab-flex ab-flex-col ab-items-stretch"
    >
      <TabsList className="-ab-pt-1 ab-h-12 !ab-justify-start !ab-min-h-12 ab-items-stretch ab-transparent">
        {tools.map((tool, index) => (
          <TabsTrigger
            key={tool.name + Math.random()*10000}
            value={tool.name}
            onClick={() => liveActiveToolAtom.set(tool.name)}
            className={`!ab-pt-0 !ab-max-h-10 !ab-text-md !ab-px-1 ${
              activeViewStore === tool.name
                ? "ab-ftr-active-menu-item-main"
                : "ab-ftr-menu-item"
            } ${tool.closed ? 'ab-hidden' : ''} !ab-shadow-none !ab-border-none `}
          >
            {index !== 0 && (<Separator orientation="vertical" className="!ab-h-4 !ab-mr-2 !-ab-ml-0"/>)}
            {tool.icon} 
            <span className={`ab-ml-1 ${activeViewStore === tool.name ? 'ab-font-bold' : ''}`}>
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
          hidden={activeViewStore !== tool.name}
          value={tool.name}
          key={tool.name}
          className="ab-m-0 ab-p-0 !-ab-mt-1 !ab-overflow-hidden !ab-overflow-y-auto ab-h-full"
        >
          <tool.module isActive={activeViewStore === tool.name} />
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
