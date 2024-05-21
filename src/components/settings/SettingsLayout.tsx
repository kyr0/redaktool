import { CalendarIcon, CogIcon, Minimize } from "lucide-react";
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
} from "../../ui/resizable";
import { useCallback, useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../ui/form";
import { Input } from "../../ui/input";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-select";
import { prefChrome } from "../../lib/content-script/prefs";
import { Button } from "../../ui/button";
import { OPEN_AI_API_KEY_NAME } from "../../shared";

export type SettingsNames =
  | "openai"
  | "gemini"
  | "claude"
  | "cohere"
  | "huggingface";

const OpenAiFormSchema = z.object({
  apiKey: z.string().min(2),
});

export const SettingsLayout = () => {
  const openAiSettingsForm = useForm<z.infer<typeof OpenAiFormSchema>>({
    resolver: zodResolver(OpenAiFormSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  useEffect(() => {
    (async () => {
      console.log(
        "setting openai api key",
        await prefChrome<string>(OPEN_AI_API_KEY_NAME).get(),
      );
      openAiSettingsForm.setValue(
        "apiKey",
        await prefChrome<string>(OPEN_AI_API_KEY_NAME).get(),
      );
    })();
  }, []);

  const [activeSttingsModule, setActiveSettingsModule] =
    useState<SettingsNames>("openai");

  const onSetActiveSettingsModule = useCallback(
    (module: string) => {
      setActiveSettingsModule(module as SettingsNames);
    },
    [setActiveSettingsModule],
  );

  const onSendSaveOpenAiSettings = useCallback(async () => {
    try {
      openAiSettingsForm.clearErrors();
      const valid = await openAiSettingsForm.trigger(["apiKey"]);

      if (!valid) {
        return;
      }

      console.log(
        "sending save openai key",
        openAiSettingsForm.getValues().apiKey,
      );

      prefChrome(OPEN_AI_API_KEY_NAME).set(
        openAiSettingsForm.getValues().apiKey,
      );
    } catch (error) {
      console.log("Form error", error);
    }
  }, [openAiSettingsForm]);

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
                  value="claude"
                  onSelect={onSetActiveSettingsModule}
                  className={
                    activeSttingsModule === "gemini"
                      ? "ab-ftr-active-menu-item"
                      : "ab-ftr-menu-item"
                  }
                >
                  <span>Anthropics</span>
                </CommandItem>
              </CommandGroup>
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
            </CommandList>
          </Command>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80} minSize={60}>
        <div className="ab-flex ab-h-full ab-p-2">
          {activeSttingsModule === "openai" && (
            <div className="ab-flex ab-h-full ab-p-2">
              <div className="ab-flex ab-flex-col ab-ml-4">
                <span className="ab-text-2xl">OpenAI</span>
                <span className="ab-text-sm">
                  Konfigurieren Sie hier den API-Schlüssel und weitere
                  Einstellungen.
                </span>

                <Form {...openAiSettingsForm}>
                  <div className="ab-space-y-2">
                    <div className="ab-grid ab-grid-cols-1 ab-gap-4">
                      <FormField
                        control={openAiSettingsForm.control}
                        name="apiKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API-Schlüssel</FormLabel>
                            <FormControl>
                              <Input
                                className="ab-bg-white ab-text-black ab-border-gray-300 dark:ab-bg-gray-900 dark:ab-border-gray-500 dark:ab-text-white"
                                placeholder={"no-key"}
                                type="password"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Dieser Schlüssel wird benötigt, um die OpenAI-API
                              zu verwenden. Sie erhalten ihn über{" "}
                              <a
                                href="https://platform.openai.com/signup"
                                target="_blank"
                                rel="noreferrer"
                              >
                                diese Seite
                              </a>
                              .
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button onClick={onSendSaveOpenAiSettings}>
                      Speichern
                    </Button>
                  </div>
                </Form>
              </div>
            </div>
          )}

          {activeSttingsModule === "gemini" && (
            <div className="ab-flex ab-h-full ab-p-2">
              <div className="ab-flex ab-flex-col ab-ml-4">
                <span className="ab-text-2xl">Gemini Settings</span>
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
