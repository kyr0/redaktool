import { ArrowRightCircle, CalendarIcon, CogIcon, CompassIcon, Languages, List, Mic, Minimize, Newspaper, PenToolIcon, SendIcon, User2Icon } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "../../ui/command"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup, VerticalResizeHandle } from "../../ui/resizable"
import { MarkdownEditor, markdownDefaultContent } from "../MarkdownEditor"
import { calculateTokensFromBudget, generatePrompt, type Prompt } from "../../lib/content-script/prompt-template"
import { Button } from "../../ui/button"
import { useCallback, useEffect, useState } from "react"
import { getScratchpadEditorContentStore, scratchpadEditorContentAtom, scratchpadEditorPlaceholderMarkdown } from "../../lib/content-script/stores/scratchpad"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs"
import { formatCurrencyForDisplay } from "../../lib/content-script/format"

export type ToolNames = "translate" | "summarize" | "fact-check" | "rewrite" | "voice-over" | "humanize"

export const ScratchpadLayout = () => {

    const [activeAiToolModule, setActiveAiToolModule] = useState<ToolNames>("translate")
    const [prompt, setPrompt] = useState<Prompt>({
        text: '',
        encoded: [],
        price: 0,
    })
    
    const onAiToolSelect = (command: string) => {

        console.log('onAiToolSelect', command)
        switch (command as ToolNames) {
            default:
            case "translate":
                setActiveAiToolModule("translate")
                break
            case "summarize":
                setActiveAiToolModule("summarize")
                break
            case "fact-check":
                setActiveAiToolModule("fact-check")
                break
            case "rewrite":
                setActiveAiToolModule("rewrite")
                break
            case "voice-over":
                setActiveAiToolModule("voice-over")
                break
        }
    }

    const scratchpadEditorContent$ = getScratchpadEditorContentStore()
    //const [currentMarkdown, setCurrentMarkdown] = useState<string>(scratchpadEditorContent$)
    //const [textToPromptFor, setTextToPromptFor] = useState<string>("Change the ScratchPad content to re-generate the prompt")

    const onMarkdownChange = useCallback((markdown: string) => {
        console.log('markdown changed!', markdown)

        // broadcast the new markdown to the store
        scratchpadEditorContentAtom.set(markdown)

        //setTextToPromptFor(markdown)
        //setCurrentMarkdown(markdown)
    }, [])

    useEffect(() => {
        setPrompt(generatePrompt('translation', {
            AUDIENCE: 'news reader',
            CONTEXT: 'Newspaper, news article, news blog, newsletter',
            MARKDOWN: scratchpadEditorContent$,
            TARGET_LANGUAGE: 'English'
        }))
    }, [scratchpadEditorContent$])


    useEffect(() => {

        console.log('activeAiToolModule', activeAiToolModule)
        switch (activeAiToolModule as ToolNames) {

            case "translate":
                setPrompt(generatePrompt('translation', {
                    AUDIENCE: 'news reader',
                    CONTEXT: 'Newspaper, news article, news blog, newsletter',
                    MARKDOWN: scratchpadEditorContent$,
                    TARGET_LANGUAGE: 'English'
                }))
                break
        }
    }, [activeAiToolModule]);


    useEffect(() => {
        console.log('new prompt', prompt)
    }, [prompt])

    return (
        <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={65} minSize={60} className="!ab-overflow-y-scroll">
                <Tabs defaultValue="source" orientation="vertical" className="ab-p-0 ab-m-0 ab-text-sm ab-h-full">
                    <TabsList className="ab-m-0">
                        <TabsTrigger value="source" className="!ab-text-[12px] ab-ftr-active-menu-item"><Newspaper className="ab-w-3 ab-h-5 ab-shrink-0 ab-mr-1"/> Content-Editor <ArrowRightCircle className="ab-w-3 ab-h-5 ab-shrink-0 ab-mr-1 ab-ml-1"/></TabsTrigger>
                        <TabsTrigger disabled value="translation" className="!ab-text-[12px] ab-opacity-45"><Languages className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1"/> Übersetzt</TabsTrigger>
                        <TabsTrigger disabled value="summary" className="!ab-text-[12px] ab-opacity-45"><CompassIcon className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1"/> Zusammengefasst</TabsTrigger>
                        <TabsTrigger disabled value="evidence-findings" className="!ab-text-[12px] ab-opacity-45"><List className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1"/> Fakten-gecheckt</TabsTrigger>
                        <TabsTrigger disabled value="rewrite" className="!ab-text-[12px] ab-opacity-45"><PenToolIcon className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1"/> Neuformuliert</TabsTrigger>
                        <TabsTrigger disabled value="humanized" className="!ab-text-[12px] ab-opacity-45"><PenToolIcon className="ab-w-3 ab-h-3 ab-shrink-0 ab-mr-1"/> Humanisiert</TabsTrigger>
                    </TabsList>
                    <TabsContent value="source" className="ab-m-0 ab-h-full">
                        <MarkdownEditor 
                            defaultValue={scratchpadEditorContent$}
                            placeholder={scratchpadEditorPlaceholderMarkdown}
                            name="scratchpadEditor"
                            showToolbar={true}
                            onChange={onMarkdownChange} 
                        />
                    </TabsContent>
                    <TabsContent value="translation">TODO</TabsContent>
                    <TabsContent value="summary">TODO</TabsContent>
                    <TabsContent value="evidence-findings">TODO</TabsContent>
                    <TabsContent value="rewrite">TODO</TabsContent>
                </Tabs>

            </ResizablePanel>
            <VerticalResizeHandle />
            <ResizablePanel defaultSize={35} minSize={20}>
                <ResizablePanelGroup direction="horizontal">
                    <ResizablePanel defaultSize={30} minSize={10}>  
                        <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-sticky ab-top-0 ab-z-30 ab-justify-between">
                            <h5 className="ab-font-bold ab-text-sm ab-p-1 ab-px-2]">
                                KI-Werkzeuge:
                            </h5>
                        </div>
                        <div className="ab-flex ab-h-full ab-items-center ab-justify-center ab-p-2">
                        <Command>
                            <CommandList>
                                <CommandGroup>
                                    <CommandItem value="translate" onSelect={onAiToolSelect} className={activeAiToolModule === 'translate' ? `ab-ftr-active-menu-item` : 'ab-ftr-menu-item'}>
                                        <Languages className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                                        <span>Übersetzen</span>
                                        <CommandShortcut>⌃T</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem value="summarize" onSelect={onAiToolSelect} className={activeAiToolModule === 'summarize' ? `ab-ftr-active-menu-item` : 'ab-ftr-menu-item'}>
                                        <CompassIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                                        <span>Zusammenfassen</span>
                                        <CommandShortcut>⌃Z</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem value="fact-check" onSelect={onAiToolSelect} className={activeAiToolModule === 'fact-check' ? `ab-ftr-active-menu-item` : 'ab-ftr-menu-item'}>
                                        <List className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                                        <span>Fakten-Check</span>
                                        <CommandShortcut>⌃C</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem value="rewrite" onSelect={onAiToolSelect} className={activeAiToolModule === 'rewrite' ? `ab-ftr-active-menu-item` : 'ab-ftr-menu-item'}>
                                        <PenToolIcon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                                        <span>Neu formulieren</span>
                                        <CommandShortcut>⌃N</CommandShortcut>
                                    </CommandItem>
                                    <CommandItem value="humanize" onSelect={onAiToolSelect} className={activeAiToolModule === 'humanize' ? `ab-ftr-active-menu-item` : 'ab-ftr-menu-item'}>
                                        <User2Icon className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                                        <span>Humanisieren</span>
                                        <CommandShortcut>⌃H</CommandShortcut>
                                    </CommandItem>
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                    <CommandItem value="voice-over" onSelect={onAiToolSelect} className={activeAiToolModule === 'voice-over' ? `ab-ftr-active-menu-item` : 'ab-ftr-menu-item'}>
                                        <Mic className="ab-mr-2 ab-h-4 ab-w-4 ab-shrink-0" />
                                        <span>Voice-over</span>
                                        <CommandShortcut>⌃V</CommandShortcut>
                                    </CommandItem>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                        </div>
                    </ResizablePanel>

                    <ResizableHandle withHandle className="ml-1 mr-1" />
            
                    <ResizablePanel defaultSize={70} minSize={60} className="ab-h-full ab-flex ab-flex-col ab-w-full">
                        <div className="ab-ftr-bg ab-flex ab-flex-row ab-ml-1 ab-justify-between">
                            <h5 className="ab-font-bold ab-p-1 ab-px-2">
                                Dynamischer KI-Prompt:
                            </h5>
                        </div>
                        <div className="ab-flex-1 ab-overflow-auto ab-w-full">
                            <MarkdownEditor 
                                placeholder="Change the ScratchPad content to re-generate the prompt" 
                                defaultValue={prompt.text} 
                                name="scratchpadPromptEditor"
                                showToolbar={false}
                                onChange={onMarkdownChange} />
                        </div>
                        <div className="ab-flex ab-ftr-bg ab-flex-row ab-ml-1 ab-mr-0 ab-pr-0 ab-justify-between">
                            <h5 className="ab-font-bold ab-p-1 ab-px-2" style={{ fontSize: '0.9rem' }}>
                                Kosten: {prompt.encoded.length} Token = ~{formatCurrencyForDisplay(prompt.price)}€; verbleibende Tokens: {formatCurrencyForDisplay(calculateTokensFromBudget(20 /* USD */))}
                            </h5>
                            <Button size={"sm"} className="ab-scale-75 ab-ftr-button ab-mr-0">
                                <SendIcon className="ab-w-4 ab-h-4" />
                                <span>Senden</span>
                            </Button>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
                
            </ResizablePanel>
        </ResizablePanelGroup>
    )
}