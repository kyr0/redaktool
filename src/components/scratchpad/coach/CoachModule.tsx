import { atom } from "nanostores";
import { GenericModule } from "../GenericModule";
import { useCallback } from "react";
import {
  type CoachPromptValues,
  promptTemplateCoach,
} from "../../../data/prompt-templates/coach";

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

const CoachPromptValuesSchema = z.object({
  AUDIENCE: z.string(),
  FORMAT: z.string(),
  TONE: z.string(),
  CUSTOM_INSTRUCTION: z.string(),
});

export const CoachModule = () => {
  const { t, i18n } = useTranslation();

  const form = useForm<z.infer<typeof CoachPromptValuesSchema>>({
    resolver: zodResolver(CoachPromptValuesSchema),
    defaultValues: {
      AUDIENCE: "general public, avg. educated adults",
      FORMAT: "newsletter entry",
      TONE: "informative, humorous, engaging",
      CUSTOM_INSTRUCTION: "",
    },
  });

  const getPromptValues = useCallback(() => {
    console.log("form.getValues()", form.getValues());
    return form.getValues() as CoachPromptValues;
  }, [form]);

  return (
    <GenericModule
      defaultModelName="gpt-4o"
      defaultPromptTemplate={promptTemplateCoach}
      onCustomInstructionChange={(instruction) => {
        form.setValue("CUSTOM_INSTRUCTION", instruction);
      }}
      name="coach"
      promptSettingsWrapperClassName="ab-overflow-y-auto"
      editorAtom={editorAtom}
      getPromptValues={getPromptValues}
      outputTokenScaleFactor={4}
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
            name="FORMAT"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Format</FormLabel>
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
                    <SelectItem value="blog article">Blog-Artikel</SelectItem>
                    <SelectItem value="newsletter entry">
                      Newsletter-Eintrag
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </Form>
      </div>
    </GenericModule>
  );
};
