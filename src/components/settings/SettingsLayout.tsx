import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "../../ui/command";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "../../ui/resizable";
import { useCallback, useState } from "react";
import { OpenAiSettings } from "./OpenAI";

export type SettingsNames =
  | "openai"
  | "google"
  | "anthropic"
  | "cohere"
  | "huggingface";

export const SettingsLayout = () => {
  const [activeSttingsModule, setActiveSettingsModule] =
    useState<SettingsNames>("openai");

  const onSetActiveSettingsModule = useCallback(
    (module: string) => {
      setActiveSettingsModule(module as SettingsNames);
    },
    [setActiveSettingsModule],
  );

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
          <Command>
            <CommandList>
              <CommandGroup>
                <CommandItem
                  value="openai"
                  onSelect={onSetActiveSettingsModule}
                  className={
                    activeSttingsModule === "openai"
                      ? "ab-ftr-active-menu-item"
                      : "ab-ftr-menu-item"
                  }
                >
                  <span>OpenAI</span>
                </CommandItem>
                <CommandItem
                  value="anthropic"
                  onSelect={onSetActiveSettingsModule}
                  className={
                    activeSttingsModule === "anthropic"
                      ? "ab-ftr-active-menu-item"
                      : "ab-ftr-menu-item"
                  }
                >
                  <span>Anthropic</span>
                </CommandItem>
              </CommandGroup>

              {/*
              <CommandItem
                value="gemini"
                onSelect={onSetActiveSettingsModule}
                className={
                  activeSttingsModule === "gemini"
                    ? "ab-ftr-active-menu-item"
                    : "ab-ftr-menu-item"
                }
              >
                <span>Gemini</span>
              </CommandItem>
              <CommandItem
                value="cohere"
                onSelect={onSetActiveSettingsModule}
                className={
                  activeSttingsModule === "gemini"
                    ? "ab-ftr-active-menu-item"
                    : "ab-ftr-menu-item"
                }
              >
                <span>Cohere</span>
              </CommandItem>
              <CommandItem
                value="huggingface"
                onSelect={onSetActiveSettingsModule}
                className={
                  activeSttingsModule === "gemini"
                    ? "ab-ftr-active-menu-item"
                    : "ab-ftr-menu-item"
                }
              >
                <span>HuggingFace</span>
              </CommandItem>
              */}
            </CommandList>
          </Command>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80} minSize={60}>
        <div className="ab-flex ab-h-full ab-p-2">
          {activeSttingsModule === "openai" && <OpenAiSettings />}

          {activeSttingsModule === "anthropic" && (
            <div className="ab-flex ab-h-full ab-p-2">
              <div className="ab-flex ab-flex-col ab-ml-4">
                <span className="ab-text-2xl">Anthropic Settings</span>
                <span className="ab-text-sm">
                  Configure your Gemini API key and other settings
                </span>
              </div>
            </div>
          )}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
