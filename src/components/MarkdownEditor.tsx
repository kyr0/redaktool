import {
  defaultValueCtx,
  Editor,
  rootCtx,
  commandsCtx,
  editorViewOptionsCtx,
  rootAttrsCtx,
  SchemaReady,
} from "@milkdown/core";
import {
  createSlice,
  type MilkdownPlugin,
  type Telemetry,
} from "@milkdown/ctx";
import { blockquoteSchema, headingSchema } from "@milkdown/preset-commonmark";
import { $command, callCommand } from "@milkdown/utils";
import { setBlockType, wrapIn } from "@milkdown/prose/commands";
import { nord } from "@milkdown/theme-nord";
import {
  Milkdown,
  MilkdownProvider,
  useEditor,
  useInstance,
} from "@milkdown/react";
import {
  commonmark,
  toggleEmphasisCommand,
  toggleStrongCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  insertHrCommand,
} from "@milkdown/preset-commonmark";
import {
  gfm,
  toggleStrikethroughCommand,
  insertTableCommand,
} from "@milkdown/preset-gfm";
import { history as proseHistory } from "@milkdown/plugin-history";
import { clipboard } from "@milkdown/plugin-clipboard";
import { cursor } from "@milkdown/plugin-cursor";
import { emoji } from "@milkdown/plugin-emoji";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BoldIcon,
  CodeIcon,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ItalicIcon,
  LinkIcon,
  QuoteIcon,
  Ruler,
  Strikethrough,
  Table,
} from "lucide-react";
import { Button } from "../ui/button";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import {
  placeholder as placeholderPlugin,
  placeholderCtx,
} from "milkdown-plugin-placeholder";
import {
  ProsemirrorAdapterProvider,
  usePluginViewContext,
  usePluginViewFactory,
  useWidgetViewFactory,
} from "@prosemirror-adapter/react";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { insertTextPlugin } from "./scratchpad/plugin/InsertText";
import { selectEditorContent } from "../lib/content-script/clipboard";
import { Separator } from "../ui/separator";
import { linkPlugin } from "./editor/LinkWidget";
//import { SlashView, slash } from './scratchpad/plugin/Slash';

export interface MilkdownInternalProps {
  defaultValue: string;
  placeholder?: string;
  onChange: (newValue: string) => void;
}

export type MarkdownEditorProps = MilkdownInternalProps & {
  name: string;
  showToolbar?: boolean;
};

// custom commands
const wrapInBlockquoteCommand = $command(
  "WrapInBlockquote",
  (ctx) => () => wrapIn(blockquoteSchema.type(ctx)),
);
const wrapInHeadingCommand = $command(
  "WrapInHeading",
  (ctx) =>
    (level = 1) =>
      setBlockType(headingSchema.type(ctx), { level }),
);

const ToolbarButton = ({ onClick, title, children, className }: any) => (
  <Button
    onClick={onClick}
    className={`ab-h-10 ab-w-10 ab-shrink-0 ab-m-1 !ab-p-0 ${className}`}
    variant={"ghost"}
    title={title}
  >
    {children}
  </Button>
);

export const milkdownEditorAtom = atom<Record<string, Editor> | null>({});
export const getMilkdownEditorStore = () => useStore(milkdownEditorAtom);

const MilkdownEditor: React.FC<MarkdownEditorProps> = ({
  name,
  defaultValue = "",
  showToolbar,
  placeholder,
  onChange,
}: MarkdownEditorProps) => {
  const { view, prevState } = usePluginViewContext();

  const pluginViewFactory = usePluginViewFactory();
  const widgetViewFactory = useWidgetViewFactory();

  useEffect(() => {
    if (view) {
      console.log("view", view.dom);
    }
  }, [view]);

  const { get, loading } = useEditor(
    (root) => {
      const editor = Editor.make()
        .enableInspector()
        .onStatusChange((status) => {
          if (status === "Created") {
            if (root) {
              // disable native spellcheck
              const editorEl = root.querySelector(".ProseMirror");
              editorEl?.setAttribute("spellcheck", "false");
            }
          }
          console.log("editor status change", status);
        })
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, defaultValue);

          /*
              ctx.set(slash.key, {
                view: pluginViewFactory({
                  component: SlashView,
                })
              })
              */

          if (placeholder !== undefined) {
            ctx.set(placeholderCtx, placeholder);
          }

          ctx.update(editorViewOptionsCtx, (prev) => ({
            ...prev,
            attributes: {
              class: "ab-outline-none ab-h-full !ab-overflow-scroll",
            },
          }));

          ctx.update(rootAttrsCtx, (prev) => ({
            ...prev,
            class: "ab-h-full ab-overflow-scroll",
          }));

          const listener = ctx.get(listenerCtx);

          console.log("listener", listener);
          console.log("ctx", ctx);
          console.log("rootCtx", rootCtx);
          console.log("editorViewOptionsCtx", editorViewOptionsCtx);

          listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
            if (markdown !== prevMarkdown) {
              onChange(markdown);
            }
          });

          const telemetry: Telemetry[] = editor.inspect();
          console.log("telemetry", telemetry);
        })
        .config(nord)
        //.use(slash)
        //.use(examplePlugin)
        .use(listener)
        .use(placeholderPlugin)
        .use(wrapInBlockquoteCommand)
        .use(wrapInHeadingCommand)
        .use(linkPlugin(widgetViewFactory))
        .use(commonmark)
        .use(gfm)
        .use(clipboard)
        .use(cursor)
        .use(emoji)
        .use(insertTextPlugin)
        .use(proseHistory);
      //.use([remarkDirective, directiveNode, inputRule])
      //.use(linkPlugin(widgetViewFactory));

      // register in editor reference registry
      milkdownEditorAtom.set({ ...milkdownEditorAtom.get(), [name]: editor });

      return editor;
    },
    [onChange, placeholder],
  );

  useEffect(() => {
    if (!get()) return;
    console.log("editor get()", get());
  }, [get]);

  const runCommand = (command: any) => {
    if (!get()) return;
    get()!.action((ctx) => {
      ctx.get(commandsCtx).call(command.key);
    });
  };

  return (
    <div className="ab-relative ab-w-full ab-h-full">
      {showToolbar && (
        <div className="ab-flex ab-p-0 ab-m-0 ab-pl-1 ab-pr-1 ab-h-10 ab-sticky ab-top-0 ab-left-0 ab-w-full ab-z-40 ab-items-start ab-justify-start ab-ftr-active-menu-item">
          <ToolbarButton
            onClick={() => get()!.action(callCommand(wrapInHeadingCommand.key))}
            className="ab-p-0"
            title="H1/Normal"
          >
            <Heading1 className="ab-shrink-0 !ab-w-6 !ab-h-6" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 2))
            }
            title="H2/Normal"
          >
            <Heading2 className="ab-shrink-0 !ab-w-6 !ab-h-6" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 3))
            }
            title="H2/Normal"
          >
            <Heading3 className="ab-shrink-0 !ab-w-6 !ab-h-6" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 4))
            }
            title="H2/Normal"
          >
            <Heading4 className="ab-shrink-0 !ab-w-6 !ab-h-6" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 5))
            }
            title="H2/Normal"
          >
            <Heading5 className="ab-shrink-0 !ab-w-6 !ab-h-6" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 6))
            }
            title="H2/Normal"
          >
            <Heading6 className="ab-shrink-0 !ab-w-6 !ab-h-6" />
          </ToolbarButton>
          <Separator
            orientation="vertical"
            className="!ab-w-1 !ab-h-8 !ab-m-1"
          />
          <ToolbarButton
            onClick={() => runCommand(toggleEmphasisCommand)}
            title="Italic/Normal"
          >
            <ItalicIcon className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(toggleStrongCommand)}
            title="Bold/Normal"
          >
            <BoldIcon className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(toggleStrikethroughCommand)}
            title="Strikethrough/Normal"
          >
            <Strikethrough className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <Separator
            orientation="vertical"
            className="!ab-w-1 !ab-h-8 !ab-m-1"
          />
          <ToolbarButton
            onClick={() => runCommand(toggleLinkCommand)}
            title="Link/Unlink"
          >
            <LinkIcon className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(toggleInlineCodeCommand)}
            title="Code/Normal"
          >
            <CodeIcon className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(insertHrCommand)}
            title="Horizontal line/Normal"
          >
            <Ruler className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(insertTableCommand)}
            title="Table"
          >
            <Table className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInBlockquoteCommand.key))
            }
            title="Blockquote/Normal"
          >
            <QuoteIcon className="ab-shrink-0 !ab-w-6 !ab-h-6" />
          </ToolbarButton>
        </div>
      )}
      <div
        data-editor-name={name}
        className="ab-pl-1 ab-pr-1 ab-h-full ab-ml-1 ab-mr-1"
      >
        <Milkdown />
      </div>
    </div>
  );
};

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  name,
  showToolbar,
  defaultValue = "",
  placeholder,
  onChange,
}: MarkdownEditorProps) => {
  const [value, setValue] = useState(defaultValue);
  const handleChange = useCallback(
    (newValue: string) => {
      setValue(newValue);
      onChange?.(newValue);
    },
    [setValue, onChange],
  );

  return (
    <MilkdownProvider>
      <ProsemirrorAdapterProvider>
        <input type="hidden" name={name} value={value} />
        <MilkdownEditor
          name={name}
          showToolbar={showToolbar}
          defaultValue={defaultValue}
          onChange={handleChange}
          placeholder={placeholder}
        />
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  );
};
