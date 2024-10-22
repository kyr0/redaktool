import { memo, useCallback, useState, type FC } from "react";
import type { GenericPersistentModuleWrapperProps } from "../GenericPersistentModule";
import { useStore } from "@nanostores/react";
import { BUILTIN_TOOLS, lastActiveViewDb, liveActiveToolAtom, liveToolsStateAtom, toolsStateDb, type TextTool, type ToolName } from "../state";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "../../../ui/card";
import { useTranslation } from "react-i18next";
import { Button } from "../../../ui/button";
import { BlocksIcon, PlusIcon } from "lucide-react";
import { Input } from "../../../ui/input";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Separator } from "../../../ui/separator";

export const CommunityModule: FC<GenericPersistentModuleWrapperProps> = memo(({ isActive }) => {
  const toolsStore = useStore(liveToolsStateAtom);
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [communitySearchTerm, setCommunitySearchTerm] = useState("");

  // filter out tools that are in the toolsStore and match the search term
  const filteredTools = BUILTIN_TOOLS.filter(tool => 
    !toolsStore.includes(tool.name) && tool.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // community tools state (currently empty)
  const communityTools: Array<TextTool> = []; // Assuming community tools will be added here

  // filter community tools based on the community search term
  const filteredCommunityTools = communityTools.filter(tool =>
    tool.label.toLowerCase().includes(communitySearchTerm.toLowerCase())
  );

  const onAddTool = useCallback((toolName: ToolName) => {
    const newTools = [...toolsStore, toolName];
    liveToolsStateAtom.set(newTools);
    toolsStateDb.set(newTools); // save the new tools state to the database
    liveActiveToolAtom.set(toolName); // set the active tool to the newly added tool
    lastActiveViewDb.set(toolName); // save the active tool to the database
  }, [toolsStore]);

  return (
    <>
      <div className="ab-grid ab-grid-cols-2 ab-items-center ab-justify-between ab-mx-auto ab-m-2 ab-ml-3">
        <div className="ab-flex ab-items-center ab-justify-start ab-space-x-2">
          <PlusIcon className="ab-flex ab-shrink-0 ab-w-8 ab-h-8"/>
          <h2 className="ab-text-sm ab-font-bold">{t("header_builtin_tools")}</h2>
        </div>
        <div className="ab-mb-2 ab-flex ab-justify-center ab-items-center ab-gap-2">
          <MagnifyingGlassIcon className="ab-flex ab-shrink-0 ab-opacity-50 ab-w-6 ab-h-6" />
          <Input 
            type="text" 
            placeholder={t("type_to_fitler_tools")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ab-w-full"
          />
        </div>
      </div>

      <p className="ab-mb-4 ab-ml-3">
        {t("add_tools_description")}
      </p>

      <div className="ab-grid ab-grid-cols-2 ab-gap-4 ab-mx-auto ab-ml-2">
        {filteredTools.length > 0 ? (
          filteredTools.map(tool => (
            <Card key={tool.name} className="ab-shadow-md ab-rounded-md">
              <CardHeader className="ab-flex ab-items-center">
                <CardTitle className="ab-flex ab-items-center">
                  {tool.icon}
                  <span className="ab-ml-2">{tool.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="ab-text-left">
                {t(`module_${tool.name}_description` as any)}
              </CardContent>
              <CardFooter className="ab-flex ab-justify-end">
                <Button onClick={() => onAddTool(tool.name)} className="ab-flex ab-items-center">
                  <PlusIcon className="ab-mr-2" />
                  {t("add_tool")}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="ab-text-center ab-text-gray-500 ab-mt-10">No built-in tools available.</p>
        )}
      </div>

      <Separator className="ab-mt-4" />

      <div className="ab-grid ab-grid-cols-2 ab-items-center ab-justify-between ab-mx-auto ab-m-2 ab-mt-4 ab-ml-3">
        <div className="ab-flex ab-items-center ab-justify-start ab-space-x-2">
          <BlocksIcon className="ab-flex ab-shrink-0 ab-w-8 ab-h-8"/>
          <h2 className="ab-text-sm ab-font-bold">{t("header_community_tools")}</h2>
        </div>
        <div className="ab-mb-2 ab-flex ab-justify-center ab-items-center ab-gap-2">
          <MagnifyingGlassIcon className="ab-flex ab-shrink-0 ab-opacity-50 ab-w-6 ab-h-6" />
          <Input 
            type="text" 
            placeholder="Type to filter community tools..."
            value={communitySearchTerm}
            onChange={(e) => setCommunitySearchTerm(e.target.value)}
            className="ab-w-full"
          />
        </div>
      </div>

      <p className="ab-mb-4  ab-ml-3">
        {t("add_community_tools_description")}
      </p>

      <div className="ab-grid ab-grid-cols-2 ab-gap-4 ab-mx-auto ab-ml-2">
        {filteredCommunityTools.length > 0 ? (
          filteredCommunityTools.map(tool => (
            <Card key={tool.name} className="ab-shadow-md ab-rounded-md">
              <CardHeader className="ab-flex ab-items-center">
                <CardTitle className="ab-flex ab-items-center">
                  {tool.icon}
                  <span className="ab-ml-2">{tool.label}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="ab-text-left">
                {t(`module_${tool.name}_description` as any)}
              </CardContent>
              <CardFooter className="ab-flex ab-justify-end">
                <Button onClick={() => onAddTool(tool.name)} className="ab-flex ab-items-center">
                  <PlusIcon className="ab-mr-2" />
                  {t("add_tool")}
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="ab-text-center ab-text-gray-500 ab-mt-10">{t("no_community_tools_found")}</p>
        )}
      </div>
    </>
  );
});
