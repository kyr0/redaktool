import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { PenIcon, Languages, PenTool, BookCheck, ALargeSmall, MessageCircleDashed, PlusIcon, AlignJustifyIcon } from "lucide-react";
import { atom } from "nanostores";
import type { FC } from "react";
import { CoachModule } from "./coach/CoachModule";
import { CommunityModule } from "./community/CommunityModule";
import { ExtractionModule } from "./extraction/ExtractionModule";
import type { GenericPersistentModuleWrapperProps } from "./GenericPersistentModule";
import { InterviewModule } from "./interview/InterviewModule";
import { ProofreadingModule } from "./proofreading/ProofreadingModule";
import { ProseModule } from "./prose/ProseModule";
import { TitlesModule } from "./titles/TitlesModule";
import { TranslationModule } from "./translation/TranslationModule";
import { db } from "../../lib/content-script/db";

export interface TextTool {
  name: ToolName;
  label: string;
  icon: React.ReactNode;
  closed: boolean;
  closable: boolean;
  module: FC<GenericPersistentModuleWrapperProps>;
}

export const BUILTIN_TOOLS: Array<TextTool> = [{
  name: "prose",
  label: "Prosa",
  closable: true,
  closed: false,
  icon: <PenIcon className="ab-shrink-0 ab-w-4 ab-h-4" />,
  module: ProseModule
}, {
  name: "source",
  label: "Zusammenfassung",
  closable: true,
  closed: false,
  icon: <AlignJustifyIcon className="ab-shrink-0 ab-w-4 ab-h-4" />,
  module: ExtractionModule
}, {
  name: "translation",
  label: "Übersetzung",
  closable: true,
  closed: false,
  icon: <Languages className="ab-shrink-0 ab-w-4 ab-h-4" />,
  module: TranslationModule
}, {
  name: "coach",
  closable: true,
  closed: false,
  label: "Schreib-Coach",
  icon: <PenTool className="ab-shrink-0 ab-w-4 ab-h-4" />,
  module: CoachModule
}, {
  name: "rewrite",
  label: "Lektorat",
  closable: true,
  closed: false,
  icon: <BookCheck className="ab-shrink-0 ab-w-4 ab-h-4" />,
  module: ProofreadingModule
}, {
  name: "titles",
  label: "Titel",
  closable: true,
  closed: false,
  icon: <ALargeSmall className="ab-shrink-0 ab-w-4 ab-h-4" />,
  module: TitlesModule
}, {
  name: "interview",
  label: "Interview",
  closable: true,
  closed: false,
  icon: <MessageCircleDashed className="ab-shrink-0 ab-w-4 ab-h-4" />,
  module: InterviewModule
}, {
  name: "community",
  closable: false,
  closed: false,
  label: "Mehr...",
  icon: <PlusIcon className="ab-shrink-0 ab-h-6 ab-w-6" />,
  module: CommunityModule
}
];

export type ToolName =
| "prose"
| "source"
| "translation"
| "titles"
| "rewrite"
| "coach"
| "interview"
| "community";

export const DEFAULT_TOOLS_ACTIVE: Array<ToolName> = ["prose", "source", "translation", "community"];

export const liveToolsStateAtom = atom<Array<ToolName>>(DEFAULT_TOOLS_ACTIVE);
export const toolsStateDb = db<Array<ToolName>>("toolsState", DEFAULT_TOOLS_ACTIVE);

export const liveActiveToolAtom = atom<ToolName | null>(null);
export const lastActiveViewDb = db("lastActiveView")
