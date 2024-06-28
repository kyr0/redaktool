import { useState } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTranslation } from "react-i18next";

export interface AiModelEntry {
  value: string;
  label: string;
}

export interface AiModelDropdownProps {
  value: string;
  options: Array<AiModelEntry>;
  onChange: (value: string) => void;
}

export function AiModelDropdown({
  value,
  options,
  onChange,
}: AiModelDropdownProps) {
  const { t, i18n } = useTranslation();
  const [selectedValue, setSelectedValue] = useState<string>(value);
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
            onSelect={() => {
              setSelectedValue(option.value);
              onChange(option.value);
            }}
          >
            <span>{option.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
