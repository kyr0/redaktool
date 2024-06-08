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

export function AiModelDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">OpenAI: GPT-4o</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 ab-z-[2147483646]">
        <DropdownMenuItem>
          <span>Gemini Pro</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <span>Claude</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <span>HuggingFace</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal container={window.__ftrShadowRoot}>
              <DropdownMenuSubContent className="ab-z-[2147483647]">
                <DropdownMenuItem>
                  <span>OpenChat 3.5 (Mistral)</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Wiedervereinigung</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
