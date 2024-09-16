import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderIcon, SendIcon, XIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
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
import { useTranslation } from "react-i18next";

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
}: { containerEl: HTMLElement | null }) => {
  const { t } = useTranslation();
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
      usageStatistics: "-", // TODO
      smartlookSessionId: "",
    },
  });

  const [formMessageType, setFormMessageType] = useState<
    "success" | "error" | null
  >(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openState, setOpenState] = useState<boolean>(false);

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

      const response = await fetch("https://www.redaktool.ai/api/feedback", {
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
      <Dialog open={openState}>
        <DialogTrigger className={"ab-flex"} onClick={() => setOpenState(true)}>
          <div className="ab-ftr-bg ab-my-auto ab-p-0 ab-m-0 ab-px-1 ab-origin-centerab-border-1 ab-flex ab-transform ab-transition-opacity ab-duration-150 ab-rounded">
            <span className="ab-mx-auto !ab-text-sm">
              {t("feedback.buttonTitle")}
            </span>
          </div>
        </DialogTrigger>
        <DialogContent
          showOverlay={false}
          wrapperClassName="ab-fixed ab-left-[50%] ab-top-[50%] ab-grid ab-w-full ab-max-w-lg ab-translate-x-[-50%] ab-translate-y-[-50%] ab-ftr-bg-contrast ab-z-[2147483641]"
        >
          <DialogHeader className="ab-rounded-sm ab-flex !ab-justify-between !ab-items-center !ab-flex-row ">
            <span className="ab-m-2 ab-font-bold">
              {t("feedback.modalTitle")}
            </span>
            <Button className="!ab-p-0 ab-h-6 ab-w-6 !ab-m-0 !ab-mr-2" variant={"ghost"} onClick={() => setOpenState(false)}>
              <XIcon className="ab-h-6 ab-w-6 ab-shrink-0" />
            </Button>
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
                  className="ab-w-full ab-flex ab-justify-center ab-items-center ab-text-sm hover:!ab-bg-primary-foreground"
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
