import { useState } from "react";
import type { ModelName } from "../lib/worker/llm/prompt";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export interface AiModelEntry {
  value: ModelName;
  label: string;
}

export interface AiModelDropdownProps {
  value: ModelName;
  options: Array<AiModelEntry>;
}

export function AiModelDropdown({ value, options }: AiModelDropdownProps) {
  const { t, i18n } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<ModelName>(value);
  const selectedOption = options.find(
    (option) => option.value === selectedValue,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={"sm"}
          className="!ab-text-xs !ab-h-5 !ab-px-1 hover:!ab-bg-primary-foreground"
        >
          {selectedOption?.label || "Select Model"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ab-z-[2147483646]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => setSelectedValue(option.value)}
          >
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
