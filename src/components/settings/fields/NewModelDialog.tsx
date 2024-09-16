import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, PlusIcon, SaveIcon, SendIcon, X, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "../../../ui/dialog";

import { Button } from "../../../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../../../ui/form";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import { useTranslation } from "react-i18next";
import type { ModelSchema, SettingsFieldProps } from "../types";

const FormSchema = z.object({
  id: z.string().min(2),
  name: z.string().min(5),
});

export const NewModelButton = ({
  containerEl,
  form,
  onSave,
}: SettingsFieldProps & { containerEl: HTMLElement | null, onSave: (model: z.infer<typeof ModelSchema>) => void }) => {
  
  const { t } = useTranslation();

  const newModelForm = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      id: "",
      name: ""
    },
  });

  const [formMessageType, setFormMessageType] = useState<
    "success" | "error" | null
  >(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [openState, setOpenState] = useState<boolean>(false);

  const onAdd = useCallback(async () => {
    console.log("form.getValues()", newModelForm.getValues());

    newModelForm.clearErrors();
    const valid = await newModelForm.trigger(["id", "name"]);

    if (!valid) {
      return;
    }
    setOpenState(false);
    onSave(newModelForm.getValues());

  }, [form, newModelForm, onSave]);

  return (
    <>
      <Dialog open={openState}>
        <DialogTrigger className={"ab-flex"}>
          <Button
            size="sm"
            variant="outline"
            className="ab-m-0 ab-p-0 !ab-h-7 ab-text-sm"
            onClick={() => setOpenState(true)}>
              <PlusIcon className="ab-shrink-0 ab-w-4 ab-h-4"/> Neu
          </Button>
        </DialogTrigger>
        <DialogContent
          showOverlay={false}
          wrapperClassName="ab-fixed ab-left-[50%] ab-top-[50%] ab-grid ab-w-full ab-max-w-lg ab-translate-x-[-50%] ab-translate-y-[-50%] ab-ftr-bg-contrast ab-z-[2147483641]"
        >
          <DialogHeader className="ab-rounded-sm ab-flex !ab-justify-between !ab-items-center !ab-flex-row ">
            <span className="ab-m-2 ab-font-bold">
              KI-Modell hinzufügen
            </span>
            <Button className="!ab-p-0 ab-h-6 ab-w-6 !ab-m-0 !ab-mr-2" variant={"ghost"} onClick={() => setOpenState(false)}>
              <XIcon className="ab-h-6 ab-w-6 ab-shrink-0" />
            </Button>
          </DialogHeader>
          <div className="ab-mx-auto ab-w-full ab-max-w-sm ab-m-2">
            <DialogDescription className="ab-mb-2">
              Fügt ein Modell hinzu, dass im Modell-Selektor angezeigt werden soll.
            </DialogDescription>
            <Form {...newModelForm}>
              <div className="ab-flex ab-flex-col ab-space-y-1">
                <FormField
                  control={newModelForm.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="ab-max-w-lg ab-flex-1 !ab-text-sm ab-font-mono"
                          placeholder={`Technische KI-Modell ID (z.B. "gpt-4o")`}
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={newModelForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="ab-max-w-lg ab-flex-1 !ab-text-sm"
                          placeholder={"Anzeigename"}
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  size={"sm"}
                  className="ab-w-full ab-flex ab-justify-center ab-items-center ab-text-sm hover:!ab-bg-primary-foreground"
                  onClick={onAdd}
                >
                  <PlusIcon className="ab-h-4 ab-w-4 ab-shrink-0 ab-mr-2" />
                  Modell hinzufügen
                </Button>

                {formMessage && (
                  <FormDescription
                    className={`${
                      formMessageType === "error"
                        ? "ab-text-red-600"
                        : "ab-text-green-600"
                    } text-center`}
                  >
                    {formMessage}
                  </FormDescription>
                )}
              </div>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
