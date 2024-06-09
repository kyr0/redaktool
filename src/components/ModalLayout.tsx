import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  CogIcon,
  EditIcon,
  LibraryIcon,
  Mic2Icon,
  MicIcon,
  RadarIcon,
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
} from "../ui/command";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../ui/resizable";
import { useCallback, useState } from "react";
import { ScratchpadLayout } from "./scratchpad/ScratchpadLayout";
import { ArchiveLayout } from "./archive/ArchiveLayout";
import { TranscriptionLayout } from "./transcription/TranscriptionLayout";
import { SettingsLayout } from "./settings/SettingsLayout";
import { useTranslation, Trans } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export type ModuleNames =
  | "scratchpad"
  | "archive"
  | "settings"
  | "transcription"
  | "radar"
  | "history";

export const ModalLayout = () => {
  const [activeModule, setActiveModule] = useState<ModuleNames>("scratchpad");
  const { t, i18n } = useTranslation();

  const onCommandSelect = (command: string) => {
    switch (command) {
      case "scratchpad":
        setActiveModule("scratchpad");
        break;
      case "archive":
        setActiveModule("archive");
        break;
      case "radar":
        setActiveModule("radar");
        break;
      case "settings":
        setActiveModule("settings");
        break;
      case "transcription":
        setActiveModule("transcription");
        break;
      default:
        setActiveModule("scratchpad");
        break;
    }
  };
  const [collapsed, setCollapsed] = useState(false);

  const onToggleMenu = useCallback(() => {
    setCollapsed(!collapsed);
  }, [collapsed]);

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel
        defaultSize={20}
        minSize={15}
        className={`${collapsed ? "!ab-max-w-8" : ""}`}
      >
        <div className="ab-flex ab-ab-h-fit ab-justify-center ab-p-0">
          {collapsed && (
            <Command>
              <CommandList>
                <CommandGroup className="!ab-pl-0">
                  <CommandItem
                    value="nav"
                    onSelect={onToggleMenu}
                    style={{
                      writingMode: "vertical-lr",
                      transform: "rotate(180deg)",
                    }}
                    className={"ab-ftr-active-menu-item ab-items-end ab-w-7"}
                  >
                    <span className="ab-mt-1">Navigation</span>
                    <CommandShortcut className="ab-mt-1 !ab-mr-0 !ab-mb-0.5 !ab-ml-1 ab-flex ab-flex-col ab-justify-center ab-items-center">
                      <ArrowLeft className="ab-mr-1 ab-h-4 ab-w-4 ab-text-primary ab-shrink-0 ab-border-primary ab-border-spacing-4 ab-rounded-full ab-border-[1px]" />
                    </CommandShortcut>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          )}
          {!collapsed && (
            <Command>
              <CommandList>
                <CommandGroup className="!ab-pl-0">
                  <CommandItem
                    value="nav"
                    onSelect={onToggleMenu}
                    className={"ab-ftr-active-menu-item"}
                  >
                    <span>Navigation</span>
                    <CommandShortcut className="ab-flex ab-flex-col ab-justify-end ab-items-center">
                      <ArrowLeft className="ab-ml-2 ab-h-4 ab-w-4 ab-text-primary ab-shrink-0 ab-border-primary ab-border-spacing-4 ab-rounded-full ab-border-[1px]" />
                    </CommandShortcut>
                  </CommandItem>
                  <CommandSeparator className="ab-mb-1" />
                  <CommandItem
                    value="radar"
                    onSelect={onCommandSelect}
                    className={
                      activeModule === "radar"
                        ? "ab-ftr-active-menu-item"
                        : "ab-ftr-menu-item"
                    }
                  >
                    <RadarIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                    <span>{t("module_radar")}</span>
                    <CommandShortcut>⌃R</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    value="scratchpad"
                    onSelect={onCommandSelect}
                    className={
                      activeModule === "scratchpad"
                        ? "ab-ftr-active-menu-item"
                        : "ab-ftr-menu-item"
                    }
                  >
                    <EditIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                    <span>{t("module_scratchpad")}</span>
                    <CommandShortcut>⌃S</CommandShortcut>
                  </CommandItem>
                  <CommandItem
                    value="archive"
                    onSelect={onCommandSelect}
                    className={
                      activeModule === "archive"
                        ? "ab-ftr-active-menu-item"
                        : "ab-ftr-menu-item"
                    }
                  >
                    <LibraryIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                    <span>{t("module_archive")}</span>
                    <CommandShortcut>⌃A</CommandShortcut>
                  </CommandItem>
                </CommandGroup>

                <CommandGroup className="!ab-pl-0">
                  <CommandSeparator className="ab-mb-1 !ab-pl-0" />
                  <CommandItem
                    value="transcription"
                    onSelect={onCommandSelect}
                    className={
                      activeModule === "transcription"
                        ? "ab-ftr-active-menu-item"
                        : "ab-ftr-menu-item"
                    }
                  >
                    <MicIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                    <span>{t("module_transcription")}</span>
                    <CommandShortcut>⌃T</CommandShortcut>
                  </CommandItem>
                  <CommandSeparator className="ab-mt-1" />
                </CommandGroup>
                <CommandGroup className="!ab-pl-0">
                  <CommandItem
                    value="settings"
                    onSelect={onCommandSelect}
                    className={
                      activeModule === "settings"
                        ? "ab-ftr-active-menu-item"
                        : "ab-ftr-menu-item"
                    }
                  >
                    <CogIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                    <span>{t("module_settings")}</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80} minSize={60} className="ab-ml-2">
        {activeModule === "scratchpad" && <ScratchpadLayout />}
        {activeModule === "transcription" && <TranscriptionLayout />}
        {activeModule === "archive" && <ArchiveLayout />}
        {activeModule === "settings" && <SettingsLayout />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
