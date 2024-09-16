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
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../ui/button";
import { PlusIcon } from "@radix-ui/react-icons";
import { NewProviderSettings } from "./NewProvider";
import { inferenceProvidersDbState } from "./db";
import type * as z from "zod";
import type { NewProviderFormSchema } from "./types";
import { EditProviderSettings } from "./EditProvider";

export const SettingsLayout = () => {
  const [activeInferenceProviderName, setActiveInferenceProviderName] =
    useState<string>();
  const [inferenceProviders, setInferenceProviders] = useState<Array<z.infer<typeof NewProviderFormSchema>>>([]);
  const [selectedInferenceProvider, setSelectedInferenceProvider] = useState<z.infer<typeof NewProviderFormSchema>>();
  const [lastActiveInferenceProviderName, setLastActiveInferenceProviderName] = useState<string>();

  const updateInferenceProviders = useCallback(async (providerNamePreference?: string) => {
    (async() => {

      // sort inference providers by name 
      const inferenceProviders = (await inferenceProvidersDbState.get()).sort((a, b) => a.name.localeCompare(b.name))

      let nextProviderName = providerNamePreference;

      if (!providerNamePreference) {
        nextProviderName = inferenceProviders.length > 0 ? inferenceProviders[0].name : "new"
      }

      // set the inference providers list
      setInferenceProviders(inferenceProviders)

      // set the first inference provider as active (double-buffer because the state update is async)
      setActiveInferenceProviderName((lastActiveInferenceProvider?: string) => {
        setLastActiveInferenceProviderName(lastActiveInferenceProvider)
        return nextProviderName;
      })
    })()
  }, []);

  useEffect(() => {
    updateInferenceProviders();
  }, []);

  useEffect(() => {
    if (activeInferenceProviderName) {
      console.log("Active inference provider changed", activeInferenceProviderName)
      console.log("Inference providers", inferenceProviders)
      setSelectedInferenceProvider(inferenceProviders.find(ip => activeInferenceProviderName.toLowerCase() === ip.name.toLowerCase()))
    }
  }, [activeInferenceProviderName, lastActiveInferenceProviderName, inferenceProviders])

  const onSetActiveSettingsModule = useCallback(
    (name: string) => {
      setActiveInferenceProviderName(name.toLowerCase());
    }, [],
  );

  const onEditDone = useCallback((name: string|null) => {
    if (name === null) {
      updateInferenceProviders();
    } else {
      updateInferenceProviders(name.toLocaleLowerCase());
    }
  }, [])

  const onCreated = useCallback((name: string) => {
    updateInferenceProviders(name.toLocaleLowerCase());
  }, [])

  useEffect(() => {
    console.log("Selected inference provider", selectedInferenceProvider)
  }, [selectedInferenceProvider])

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={20} minSize={10}>
        <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
          <Command>
            <CommandList>
              <CommandGroup className="!ab-p-0 !ab-m-0 ab-mb-2" heading={(
                <span className="ab-flex ab-justify-between ab-items-center !ab-p-0 !ab-m-0 !ab-mb-2">
                  <span className="ab-text-sm">KI-Anbieter:</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="ab-m-0 ab-p-0 !ab-h-7 ab-text-sm"
                      onClick={() => {
                        onSetActiveSettingsModule("new")
                      } }
                    >
                      <PlusIcon className="ab-shrink-0 ab-w-4 ab-h-4"/> Neu
                  </Button>
                </span>
              )}>

                {inferenceProviders.map((inferenceProvider) => (
                  <CommandItem
                    key={inferenceProvider.name}
                    value={inferenceProvider.name}
                    onSelect={onSetActiveSettingsModule}
                    className={
                      activeInferenceProviderName?.toLowerCase() === inferenceProvider.name.toLowerCase()
                        ? "ab-ftr-active-menu-item"
                        : "ab-ftr-menu-item"
                    }
                  >
                    <span>{inferenceProvider.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={80} minSize={60}>
        <div className="ab-flex ab-h-full ab-p-2">
          {activeInferenceProviderName === "new" ? <NewProviderSettings onDone={onCreated}/> : 
            selectedInferenceProvider ? <EditProviderSettings onDone={onEditDone} inferenceProvider={selectedInferenceProvider} /> : <>Datenfehler.</>}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
