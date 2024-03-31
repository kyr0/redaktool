import { CalendarIcon, CogIcon, Minimize } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "../../ui/command"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "../../ui/resizable"

export const SettingsLayout = () => {
    return (
        <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={20} minSize={10}>  
                <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
                    <span className="ab-font-semibold">Menu Item List</span>
                </div>
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel defaultSize={80} minSize={60}>
                <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
                    <span className="ab-font-semibold">Settings UI per Item</span>
                </div>
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}