import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, SendIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { Button } from "../ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { useTranslation, Trans } from "react-i18next";
import { useEditor } from "@milkdown/react";

const FormSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  message: z.string().min(5),
  url: z.string(),
  usageStatistics: z.string().optional(),
  smartlookSessionId: z.string().optional(),
});

export const FeedbackButton = ({
  containerEl,
}: { containerEl: HTMLElement | undefined }) => {
  const { t, i18n } = useTranslation();
  const [containerHeightCalc, setContainerHeightCalc] = useState<number>(600);

  useEffect(() => {
    if (!containerEl) return;

    const inter = setInterval(() => {
      requestAnimationFrame(() => {
        setContainerHeightCalc(containerEl.getBoundingClientRect().height);
      });
    }, 1000);

    return () => {
      clearInterval(inter);
    };
  }, [containerEl, setContainerHeightCalc]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
      name: "",
      message: "",
      url: "",
      usageStatistics: "transcribe: 15\ntranslate: 20\nsummarize:10", // TODO: load dynamically
      smartlookSessionId: "",
    },
  });

  const [formMessageType, setFormMessageType] = useState<
    "success" | "error" | null
  >(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSendFeedbackMessage = useCallback(async () => {
    console.log("loc", document.location.href);
    console.log("form.getValues()", form.getValues());

    try {
      form.clearErrors();
      const valid = await form.trigger(["email", "message", "name"]);

      if (!valid) {
        return;
      }
      setIsLoading(true);

      const response = await fetch("https://redaktool.ai/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.getValues().email,
          name: form.getValues().name,
          url: document.location.href,
          usageStatistics: form.getValues().usageStatistics,
          message: form.getValues().message,
        }),
      });

      if (response.status !== 200) {
        setIsLoading(false);
        setFormMessageType("error");
        setFormMessage(t("feedback.errorTryAgainLater"));
        return;
      }
      setIsLoading(false);
      setFormMessageType("success");
      setFormMessage(t("feedback.thankYou"));
    } catch (error) {
      setIsLoading(false);
      setFormMessageType("error");
      setFormMessage(t("feedback.errorTryAgainLater"));
    }
  }, [form]);

  return (
    <>
      <Dialog>
        <DialogTrigger className={"ab-flex"}>
          <div
            style={{
              position: "fixed",
              right: -37,
              top: containerHeightCalc / 2 - 50,
              width: 100,
            }}
            className="ab-ftr-bg ab-my-auto ab-p-0 ab-m-0 ab-pb-1 ab-origin-center -ab-rotate-90 ab-border-1 md:ab-scale-105 lg:ab-scale-110 xl:ab-scale-125 ab-flex ab-transform ab-transition-opacity ab-duration-150 ab-rounded-md"
          >
            <span className="ab-mx-auto !ab-text-sm">
              {t("feedback.buttonTitle")}
            </span>
          </div>
        </DialogTrigger>
        <DialogContent
          showOverlay={false}
          wrapperClassName="ab-fixed ab-top-12 ab-left-12 ab-ftr-bg-contrast ab-z-[2147483641]"
        >
          <DialogHeader className="ab-rounded-sm">
            <span className="ab-m-2 ab-font-bold">
              {t("feedback.modalTitle")}
            </span>
          </DialogHeader>
          <div className="ab-mx-auto ab-w-full ab-max-w-sm ab-m-2">
            <DialogDescription className="ab-mb-2">
              {t("feedback.modalDescription")}
            </DialogDescription>
            <Form {...form}>
              <div className="ab-flex ab-flex-col ab-space-y-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="ab-max-w-lg ab-flex-1 !ab-text-sm"
                          placeholder={`${t("feedback.formFirstName")} ${t(
                            "feedback.formLastName",
                          )}`}
                          type="text"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="ab-max-w-lg ab-flex-1 !ab-text-sm"
                          placeholder={t("feedback.formEmail")}
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          className="ab-min-h-[100px] !ab-text-sm"
                          placeholder={t("feedback.formMessage")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  disabled={isLoading}
                  size={"sm"}
                  className="ab-w-full ab-flex ab-justify-center ab-items-center ab-text-sm"
                  onClick={onSendFeedbackMessage}
                >
                  {isLoading ? (
                    <LoaderIcon className="h-4 w-4" />
                  ) : (
                    <SendIcon className="h-4 w-4" />
                  )}
                  &nbsp;&nbsp;
                  {isLoading
                    ? t("feedback.registeringState")
                    : t("feedback.sendNowState")}
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
