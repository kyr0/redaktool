import { useCallback, useEffect, useRef, useState } from "react";
import {
  Form,
} from "../../ui/form";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { prefChrome } from "../../lib/content-script/prefs";
import { Button } from "../../ui/button";
import { ANTHROPIC_API_KEY_NAME } from "../../shared";
import { CheckCheck, SaveIcon, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { wellKnownAIModels } from "../../lib/content-script/ai-models";
import { ApiKeyField } from "./fields/ApiKey";
import { NewProviderFormSchema } from "./types";
import { ProviderChooserField } from "./fields/ProviderChooser";
import { ProviderEditPanel } from "./ProviderEditPanel";
import { db } from "../../lib/content-script/db";
import { inferenceProvidersDbState } from "./db";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction } from "../../ui/alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "../../ui/alert-dialog";

export interface EditProviderSettingsProps {
  inferenceProvider: z.infer<typeof NewProviderFormSchema>;
  onDone: (name: string|null) => void;
}

export const EditProviderSettings = ({ inferenceProvider, onDone }: EditProviderSettingsProps) => {
  const form = useForm<z.infer<typeof NewProviderFormSchema>>({
    resolver: zodResolver(NewProviderFormSchema),
    defaultValues: inferenceProvider,
  });

  useEffect(() => {
    form.clearErrors();
    form.reset(inferenceProvider);
    form.setValue("inferenceProviderName", inferenceProvider.inferenceProviderName);

    console.log("setting form inferenceProviderName", inferenceProvider.inferenceProviderName)
  }, [inferenceProvider]);

  const onDeleteProvider = useCallback(async () => {
    try {

      console.log("inferenceProvider to delete", inferenceProvider, inferenceProvider.name)

      const inferenceProviders = await inferenceProvidersDbState.get()
      const newInferenceProviders = inferenceProviders.filter((configuration) => configuration.name !== inferenceProvider.name)
      await inferenceProvidersDbState.set(newInferenceProviders)
      onDone(null);
      toast.info("KI-Anbieter erfolgreich gelöscht!", {
        duration: 5000,
        icon: (
          <CheckCheck className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
        ),
        style: {
          fontWeight: "normal",
        },
      });
    } catch (error) {
      console.log("Form error", error);
      toast.info(
        "Fehler beim Löschen des KI-Anbieters. Bitte versuchen Sie es später noch einmal.",
        {
          duration: 5000,
          icon: (
            <ExclamationTriangleIcon className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
          ),
          style: {
            fontWeight: "normal",
          },
        },
      );
    }
  }, [inferenceProvider]);

  const onSaveNewProviderSettings = useCallback(async () => {
    try {
      form.clearErrors();
      const valid = await form.trigger("name"/*["apiKey"]*/);
      const newInferenceProvider = form.getValues()

      // TODO: check for IoC custom validation options
      if (newInferenceProvider.inferenceProviderName !== "ollama" && (!newInferenceProvider.apiKey || newInferenceProvider.apiKey.trim() === "" || newInferenceProvider.apiKey === "no-key")) {
        form.setError("apiKey", {
          type: "required",
        })
        return;
      }

      if (!valid) {
        return;
      }

      const inferenceProviders = await inferenceProvidersDbState.get()

      /*
      const existingConfiguration = inferenceProviders.find((configuration) => configuration.inferenceProviderName === values.inferenceProviderName)

      if (existingConfiguration) {
        toast.info(
          "Fehler beim Speichern des AI-Providers. Diesen AI Inferenz-Provider gibt es schon. Bitte bearbeiten Sie die bestehende Konfiguration.",
          {
            duration: 5000,
            icon: (
              <ExclamationTriangleIcon className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
            ),
            style: {
              fontWeight: "normal",
            },
          },
        );
        return;
      }*/

      console.log("current inferenceProviders", inferenceProviders)

      console.log(
        "saving new provider settings",
      );

      // update in place
      for (let i=0; i<inferenceProviders.length; i++) {
        if (inferenceProviders[i].name.toLowerCase() === inferenceProvider.name.toLowerCase()) {
          console.log("Found the right provider to update", inferenceProviders[i])
          const newData = {
            ...form.getValues(),
            inferenceProviderName: inferenceProvider.inferenceProviderName
          }
          inferenceProviders[i] = newData
          console.log("Updated with settings", newData)
        }
      }

      await inferenceProvidersDbState.set(inferenceProviders)

      console.log("Done saving", inferenceProviders)

      onDone(form.getValues().name.toLowerCase());

      toast.info("KI-Anbieter erfolgreich aktualisiert!", {
        duration: 5000,
        icon: (
          <CheckCheck className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
        ),
        style: {
          fontWeight: "normal",
        },
      });
    } catch (error) {
      console.log("Form error", error);
      toast.info(
        "Fehler beim Speichern des KI-Anbieters. Bitte versuchen Sie es später noch einmal.",
        {
          duration: 5000,
          icon: (
            <ExclamationTriangleIcon className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
          ),
          style: {
            fontWeight: "normal",
          },
        },
      );
    }
  }, [form, inferenceProvider]);

  return (
    <div className="ab-flex ab-h-full ab-w-full">
      <div className="ab-flex ab-flex-col ab-ml-2 ab-mr-0 ab-w-full ab-h-full ab-justify-between">

        <span className="ab-flex ab-flex-col">
          <span className="ab-text-2xl">KI-Anbieter bearbeiten: {inferenceProvider.name}</span>
          <span className="ab-text-sm ab-mb-4">
            Konfigurieren Sie hier die Einstellungen des KI-Anbieters.
          </span>
        </span>

        <Form {...form}>
          <div className="ab-space-y-2 ab-h-full ab-overflow-auto">
            <div className="ab-grid ab-grid-cols-1 ab-gap-4 ab-mb-4">
              <ProviderChooserField disabled form={form} mode="update" />
              <ProviderEditPanel form={form} mode="update" />
            </div>
          </div>
        </Form>

        <span className="ab-flex ab-flex-row ab-justify-between">

          <AlertDialog>
            <AlertDialogTrigger>
                      
              <Button variant="outline" className="ab-border-red-700">
                <TrashIcon className="ab-h-4 ab-w-4 ab-shrink-0 ab-mr-2" />
                Löschen
              </Button>

            </AlertDialogTrigger>
          
            <AlertDialogContent className="!ab-ftr-bg-contrast ab-z-[2147483641]">
              <AlertDialogHeader>
                <AlertDialogTitle>Wirklich Löschen?</AlertDialogTitle>
                <AlertDialogDescription>
                  Der KI-Anbieter kann anschließend nur manuell wieder neu hinzugefügt werden.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                <AlertDialogAction onClick={onDeleteProvider}>Ja, löschen</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button onClick={onSaveNewProviderSettings}>
            <SaveIcon className="ab-h-4 ab-w-4 ab-shrink-0 ab-mr-2" />
            Speichern
          </Button>
        </span>
      </div>
    </div>
  );
};
