import { toast } from "sonner";
import { Button } from "../ui/button";
import { InfoIcon } from "lucide-react";
import type { FC, PropsWithChildren } from "react";

export const MiniInfoButton: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Button
      variant={"ghost"}
      className="!ab-p-0 !ab-m-0 ab-rounded-full !ab-h-fit-content !ab-h-5 !ab-w-5"
      onClick={() =>
        toast.info(children, {
          duration: 5000,
          icon: (
            <InfoIcon className="ab-w-16 ab-h-16 ab-shrink-0 ab-mr-2 ab-pr-2" />
          ),
          style: {
            fontWeight: "normal",
          },
        })
      }
    >
      <InfoIcon className="ab-w-4 ab-h-4" />
    </Button>
  );
};
