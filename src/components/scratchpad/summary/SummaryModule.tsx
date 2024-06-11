import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
import { useCallback } from "react";
import {
  promptTemplateSummary,
  type SummaryPromptValues,
} from "../../../data/prompt-templates/summary";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../ui/form";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";

const editorAtom = atom<string>("");

const SummaryPromptValuesSchema = z.object({
  AUDIENCE: z.string(),
  EXAMPLE: z.string(),
  MAX_SENTENCES_PER_TOPIC: z.string(),
  FORMATTING: z.string(),
  TONE: z.string(),
  TOPIC_COUNT: z.string(),
  TYPE: z.string(),
  CUSTOM_INSTRUCTION: z.string(),
});

export const SummaryModule = () => {
  const { t, i18n } = useTranslation();

  const form = useForm<z.infer<typeof SummaryPromptValuesSchema>>({
    resolver: zodResolver(SummaryPromptValuesSchema),
    defaultValues: {
      AUDIENCE: "news readers, adults, general public",
      EXAMPLE: `- First topic here.
- Second topic here.
- Third topic here.`,
      MAX_SENTENCES_PER_TOPIC: "two",
      FORMATTING: "bullet points",
      TONE: "news article, neutral",
      TOPIC_COUNT: "five",
      TYPE: "thematic",
      CUSTOM_INSTRUCTION: "",
    },
  });

  const getPromptValues = useCallback(() => {
    console.log("form.getValues()", form.getValues());
    return form.getValues() as SummaryPromptValues;
  }, [form]);

  return (
    <GenericModule
      defaultModelName="gpt-4o"
      defaultPromptTemplate={promptTemplateSummary}
      onCustomInstructionChange={(instruction) => {
        form.setValue("CUSTOM_INSTRUCTION", instruction);
      }}
      name="summary"
      promptSettingsWrapperClassName="ab-overflow-y-auto"
      editorAtom={editorAtom}
      getPromptValues={getPromptValues}
      outputTokenScaleFactor={0.5}
    >
      <div className="ab-w-full ab-h-full ab-flex ab-flex-col ab-items-strech ab-justify-start">
        <Form {...form}>
          <FormField
            control={form.control}
            name="AUDIENCE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("summaryModule.audiencePromptLabel")}</FormLabel>
                <FormControl>
                  <Input
                    className="max-w-lg flex-1 dark:border-gray-700"
                    placeholder={t("summaryModule.audiencePromptPlaceholder")}
                    type="text"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="TONE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("summaryModule.tonePromptLabel")}</FormLabel>
                <FormControl>
                  <Input
                    className="max-w-lg flex-1 dark:border-gray-700"
                    placeholder={t("summaryModule.tonePromptPlaceholder")}
                    type="text"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="TOPIC_COUNT"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("summaryModule.topicCountPromptLabel")}
                </FormLabel>
                <FormControl>
                  <Input
                    className="max-w-lg flex-1 dark:border-gray-700"
                    placeholder={t("summaryModule.topicCountPromptPlaceholder")}
                    type="text"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="TYPE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="ab-z-[2147483646]">
                    <SelectItem value="chronological">Chronologisch</SelectItem>
                    <SelectItem value="thematic">Thematisch</SelectItem>
                    <SelectItem value="chronological-thematic">
                      Chronologisch, nachfolgend thematisch
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="FORMATTING"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formatierung</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="ab-z-[2147483646]">
                    <SelectItem value="bullet points">Aufzählung</SelectItem>
                    <SelectItem value="paragraphs">Absätze</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="MAX_SENTENCES_PER_TOPIC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Max. Sätze pro Thema</FormLabel>
                <FormControl>
                  <Input
                    className="flex-1 dark:border-gray-700"
                    placeholder={"Max. Sätze pro Thema"}
                    type="text"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="EXAMPLE"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beispiel</FormLabel>
                <FormControl>
                  <Textarea
                    className="flex-1 dark:border-gray-700"
                    placeholder={"Beispiel"}
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </Form>
      </div>
    </GenericModule>
  );
};
