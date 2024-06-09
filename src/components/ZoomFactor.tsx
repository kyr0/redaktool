import { ZoomOutIcon } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";

export type ZoomOptions =
  | "ab-scale-75"
  | "ab-scale-90"
  | "ab-scale-95"
  | "ab-scale-100"
  | "ab-scale-105"
  | "ab-scale-110"
  | "ab-scale-125";

export const ZoomFactors: ZoomOptions[] = [
  "ab-scale-75",
  "ab-scale-90",
  "ab-scale-95",
  "ab-scale-100",
  "ab-scale-105",
  "ab-scale-110",
  "ab-scale-125",
];

export interface ZoomFactorProps {
  zoomFactor: ZoomOptions;
  onChangeZoomFactor: (zoomFactor: ZoomOptions) => void;
}

const formatZoomFactor = (zoomFactor: ZoomOptions) =>
  `${zoomFactor.split("-")[2]}%`;

export function ZoomFactorDropdown({
  zoomFactor,
  onChangeZoomFactor,
}: ZoomFactorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild
        className="ab-border-0 ab-h-6 ab-text-sm !ab-p-1 hover:ab-bg-transparent"
      >
        <Button className="!ab-p-0" variant="outline">
          <MagnifyingGlassIcon className="ab-h-4 ab-w-4 ab-mr-1" />
          {formatZoomFactor(zoomFactor)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ab-z-[2147483646]">
        {ZoomFactors.map((factor) => (
          <DropdownMenuItem
            key={factor}
            onClick={() => onChangeZoomFactor(factor)}
          >
            <span>{formatZoomFactor(factor)}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
