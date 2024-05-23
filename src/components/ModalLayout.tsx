import {
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
import { StackIcon } from "@radix-ui/react-icons";

export type ModuleNames =
  | "scratchpad"
  | "archive"
  | "settings"
  | "transcription"
  | "radar"
  | "history";

export const ModalLayout = () => {
  const [activeModule, setActiveModule] = useState<ModuleNames>("scratchpad");

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

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={15}>
        <div className="ab-flex ab-ab-h-fit ab-items-center ab-justify-center ab-p-0">
          <Command value={activeModule}>
            <CommandList>
              <CommandGroup>
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
                  <span>Themenfindung</span>
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
                  <span>Recherche</span>
                  <CommandShortcut>⌃S</CommandShortcut>
                </CommandItem>
                <CommandItem
                  value="history"
                  onSelect={onCommandSelect}
                  className={
                    activeModule === "history"
                      ? "ab-ftr-active-menu-item"
                      : "ab-ftr-menu-item"
                  }
                >
                  <StackIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                  <span>Verlauf</span>
                  <CommandShortcut>⌃V</CommandShortcut>
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
                  <span>Archiv</span>
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
                <span>Transkription</span>
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
                  <span>Einstellungen</span>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80} minSize={60}>
        {activeModule === "scratchpad" && <ScratchpadLayout />}
        {activeModule === "transcription" && <TranscriptionLayout />}
        {activeModule === "archive" && <ArchiveLayout />}
        {activeModule === "settings" && <SettingsLayout />}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
