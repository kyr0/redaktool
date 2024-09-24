import { useCallback, useEffect, useState } from "react";
import {
  Form,
} from "../../ui/form";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { prefChrome } from "../../lib/content-script/prefs";
import { Button } from "../../ui/button";
import { ANTHROPIC_API_KEY_NAME } from "../../shared";
import { CheckCheck, SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { wellKnownAIModels } from "../../lib/content-script/ai-models";
import { ApiKeyField } from "./fields/ApiKey";
import { NewProviderFormSchema } from "./types";
import { ProviderChooserField } from "./fields/ProviderChooser";
import { ProviderEditPanel } from "./ProviderEditPanel";
import { db } from "../../lib/content-script/db";
import { inferenceProvidersDbState } from "./db";

const defaultProviderName = "openai"

export interface NewProviderSettingsProps {
  onDone: (name: string) => void;
}

export const NewProviderSettings = ({ onDone }: NewProviderSettingsProps) => {
  const form = useForm<z.infer<typeof NewProviderFormSchema>>({
    resolver: zodResolver(NewProviderFormSchema),
    defaultValues: {
      inferenceProviderName: defaultProviderName,
      models: [],
      apiKey: "",
    },
  });

  const onSaveNewProviderSettings = useCallback(async () => {
    try {
      form.clearErrors();
      const valid = await form.trigger("name"/*["apiKey"]*/);
      const newInferenceProvider = form.getValues()
      const inferenceProviders = await inferenceProvidersDbState.get()

      // TODO: check for IoC custom validation options
      if (newInferenceProvider.inferenceProviderName !== "ollama" && (!newInferenceProvider.apiKey || newInferenceProvider.apiKey.trim() === "" || newInferenceProvider.apiKey === "no-key")) {
        form.setError("apiKey", {
          type: "required",
        })
        return;
      }

      // error if name already exists
      if (inferenceProviders.find((configuration) => configuration.name === newInferenceProvider.name)) {
        form.setError("name", {
          type: "validate",
          message: "Es gibt bereits einen KI-Anbieter mit dem gleichen Namen.",
        })
        toast.info(
          "Fehler beim Speichern des KI-Anbieters. Es gibt bereits einen KI-Anbieter mit dem gleichen Namen. Bitte bearbeiten Sie die bestehende Konfiguration.",
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
      }

      if (!valid) {
        return;
      }


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
        form.getValues(),
      );


      await inferenceProvidersDbState.set([
        ...inferenceProviders,
        newInferenceProvider
      ])

      console.log("Done saving")

      onDone(newInferenceProvider.name.toLowerCase());

      toast.info("AI-Provider erfolgreich gespeichert!", {
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
        "Fehler beim Speichern des AI-Providers. Bitte versuchen Sie es später noch einmal.",
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
  }, [form]);

  return (
    <div className="ab-flex ab-h-full ab-w-full">
      <div className="ab-flex ab-flex-col ab-ml-2 ab-mr-0 ab-w-full ab-h-full ab-justify-between">

        <span className="ab-flex ab-flex-col">
          <span className="ab-text-2xl">Neuer KI-Anbieter</span>
          <span className="ab-text-sm ab-mb-4">
            Konfigurieren Sie hier den neuen KI-Anbieter.
          </span>
        </span>

        <Form {...form}>
          <div className="ab-space-y-2 ab-h-full ab-overflow-auto">
            <div className="ab-grid ab-grid-cols-1 ab-gap-4 ab-mb-4">
              <ProviderChooserField form={form} mode={"create"} />
              <ProviderEditPanel form={form} mode="create" />
            </div>
          </div>
        </Form>

        <Button onClick={onSaveNewProviderSettings}>
          <SaveIcon className="ab-h-4 ab-w-4 ab-shrink-0 ab-mr-2" />
          Speichern
        </Button>
      </div>
    </div>
  );
};
