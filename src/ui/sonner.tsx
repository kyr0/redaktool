import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster ab-group"
      toastOptions={{
        classNames: {
          toast:
            "ab-group toast group-[.toaster]:ab-bg-background group-[.toaster]:ab-text-foreground group-[.toaster]:ab-border-border group-[.toaster]:ab-shadow-lg",
          description: "group-[.toast]:ab-text-muted-foreground",
          actionButton:
            "group-[.toast]:ab-bg-primary group-[.toast]:ab-text-primary-foreground",
          cancelButton:
            "group-[.toast]:ab-bg-muted group-[.toast]:ab-text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
