import {
  ArrowLeft,
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
import { useState } from "react";
import { ScratchpadLayout } from "./scratchpad/ScratchpadLayout";
import { ArchiveLayout } from "./archive/ArchiveLayout";
import { TranscriptionLayout } from "./transcription/TranscriptionLayout";
import { SettingsLayout } from "./settings/SettingsLayout";
import { useTranslation, Trans } from "react-i18next";

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

  const onToggleMenu = () => {
    setActiveModule(activeModule === "radar" ? "scratchpad" : "radar");
  };

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={15}>
        <div className="ab-flex ab-ab-h-fit ab-items-center ab-justify-center ab-p-0">
          <Command>
            <CommandList>
              <CommandGroup>
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
              <CommandSeparator className="ab-mb-1" />
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
              <CommandGroup>
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
