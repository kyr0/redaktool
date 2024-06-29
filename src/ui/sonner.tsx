import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster ab-group ab-absolute ab-bottom-0 ab-right-4 ab-m-4 ab-z-[2147483647] ab-ftr-bg-contrast !ab-border-2 ab-border-primary-foreground ab-rounded-md ab-p-2 ab-max-w-sm ab-shadow-lg !ab-pb-3 !ab-pl-[20px] !ab-pr-[20px]"
      toastOptions={{
        classNames: {
          title: "ab-shrink-0",
          closeButton:
            "ab-absolute ab-top-3 ab-right-3 ab-m-2 ab-text-lg ab-text-muted-foreground ab-cursor-pointer ab-scale-150 ab-font-bold",
          error: "ab-text-red-700",
          toast:
            "ab-group toast group-[.toaster]:ab-bg-background group-[.toaster]:ab-text-foreground ab-list-none !ab-text-lg ab-font-bold ab-mt-6 ab-mb-6 ab-flex ab-flex-row !ab-shrink-0",
          description:
            "group-[.toast]:ab-text-muted-foreground ab-text-sm ab-font-normal ab-mt-2 ab-mb-4 !ab-shrink-0",
          actionButton:
            "ab-p-2 ab-m-2 ab-rounded-md ab-border ab-border-primary-foreground ab-ftr-bg hover:ab-ftr-bg-primary-foreground !ab-text-sm ab-pl-4 ab-pr-4",
          cancelButton:
            "ab-p-2 ab-m-2 ab-rounded-md group-[.toast]:ab-bg-muted group-[.toast]:ab-text-muted-foreground ab-text-sm",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
