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
import { prefChrome } from "../../lib/content-script/prefs";
import { Button } from "../../ui/button";
import { ANTHROPIC_API_KEY_NAME } from "../../shared";
import { CheckCheck } from "lucide-react";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";

const AnthropicFormSchema = z.object({
  apiKey: z.string().min(2),
});

export const AnthropicSettings = () => {
  const anthropicSettingsForm = useForm<z.infer<typeof AnthropicFormSchema>>({
    resolver: zodResolver(AnthropicFormSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  useEffect(() => {
    (async () => {
      console.log(
        "setting anthropic api key",
        await prefChrome<string>(ANTHROPIC_API_KEY_NAME).get(),
      );
      anthropicSettingsForm.setValue(
        "apiKey",
        await prefChrome<string>(ANTHROPIC_API_KEY_NAME).get(),
      );
    })();
  }, []);

  const onSendSaveOpenAiSettings = useCallback(async () => {
    try {
      anthropicSettingsForm.clearErrors();
      const valid = await anthropicSettingsForm.trigger(["apiKey"]);

      if (!valid) {
        return;
      }

      console.log(
        "sending save anthropic key",
        anthropicSettingsForm.getValues().apiKey,
      );

      prefChrome(ANTHROPIC_API_KEY_NAME).set(
        anthropicSettingsForm.getValues().apiKey,
      );

      toast.info("API-Key erfolgreich gespeichert!", {
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
        "Fehler beim Speichern des API-Key. Bitte versuchen Sie es später noch einmal.",
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
  }, [anthropicSettingsForm]);

  return (
    <div className="ab-flex ab-h-full ab-p-2">
      <div className="ab-flex ab-flex-col ab-ml-4">
        <span className="ab-text-2xl">Anthropic</span>
        <span className="ab-text-sm">
          Konfigurieren Sie hier den API-Schlüssel und weitere Einstellungen.
        </span>

        <Form {...anthropicSettingsForm}>
          <div className="ab-space-y-2">
            <div className="ab-grid ab-grid-cols-1 ab-gap-4">
              <FormField
                control={anthropicSettingsForm.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API-Schlüssel</FormLabel>
                    <FormControl>
                      <Input
                        className=""
                        placeholder={"no-key"}
                        type="password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Dieser Schlüssel wird benötigt, um die Anthropic-API zu
                      verwenden. Sie erhalten ihn über{" "}
                      <a
                        href="https://console.anthropic.com/settings/keys"
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

            <Button onClick={onSendSaveOpenAiSettings}>Speichern</Button>
          </div>
        </Form>
      </div>
    </div>
  );
};
