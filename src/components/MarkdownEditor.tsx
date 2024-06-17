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
import { replaceAll, getMarkdown } from "@milkdown/utils";
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
  type ReactPluginViewUserOptions,
  type ReactWidgetViewUserOptions,
} from "@prosemirror-adapter/react";
import { atom } from "nanostores";
import { useStore } from "@nanostores/react";
import { insertTextPlugin } from "./scratchpad/plugin/InsertText";
import { selectEditorContent } from "../lib/content-script/clipboard";
import { Separator } from "../ui/separator";
import { linkPlugin } from "./editor/LinkWidget";
import type { EditorState, PluginView } from "@milkdown/prose/state";
import type { EditorView } from "@milkdown/prose/view";
//import { SlashView, slash } from './scratchpad/plugin/Slash';

export interface MilkdownEditorCreatedArgs {
  editor: Editor;
  el: HTMLElement;
  root: HTMLElement;
  view: EditorView;
  prevState?: EditorState;
  widgetViewFactory: (options: ReactWidgetViewUserOptions) => any;
  pluginViewFactory: (
    options: ReactPluginViewUserOptions,
  ) => (view: EditorView) => PluginView;
  setValue?: (value: string) => void;
  getValue?: () => string;
}

export interface MilkdownInternalProps {
  defaultValue: string;
  placeholder?: string;
  onChange: (newValue: string) => void;
  onCreated?: (args: MilkdownEditorCreatedArgs) => void;
}

export type MarkdownEditorProps = MilkdownInternalProps & {
  name: string;
  showToolbar?: boolean;
  value?: string;
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

export const milkdownEditorAtom = atom<Record<
  string,
  { editor: Editor; root: HTMLElement }
> | null>({});
export const getMilkdownEditorStore = () => useStore(milkdownEditorAtom);

const MilkdownEditor: React.FC<MarkdownEditorProps> = ({
  name,
  defaultValue = "",
  showToolbar,
  placeholder,
  onChange,
  onCreated,
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
              const editorEl = root.querySelector(
                ".ProseMirror",
              ) as HTMLElement;
              editorEl?.setAttribute("spellcheck", "false");

              if (typeof onCreated === "function") {
                onCreated({
                  editor,
                  el: editorEl,
                  root,
                  view,
                  prevState,
                  widgetViewFactory,
                  pluginViewFactory,
                  setValue: (value: string) => {
                    editor.action(replaceAll(value));
                  },
                  getValue: () => {
                    return editor.action(getMarkdown());
                  },
                });
              }

              // register in editor reference registry
              milkdownEditorAtom.set({
                ...milkdownEditorAtom.get(),
                [name]: {
                  editor,
                  root,
                },
              });
            }
          }
          //console.log("editor status change", status);
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

          //const telemetry: Telemetry[] = editor.inspect();
          //console.log("telemetry", telemetry);
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

      return editor;
    },
    [onChange, placeholder],
  );

  /*
  useEffect(() => {
    if (!get()) return;
    //console.log("editor get()", get());
    console.log("update internal editor value", defaultValue);
    get()?.ctx.set(defaultValueCtx, defaultValue);
  }, [get, defaultValue]);
  */

  const runCommand = (command: any) => {
    if (!get()) return;
    get()!.action((ctx) => {
      ctx.get(commandsCtx).call(command.key);
    });
  };

  return (
    <div className="ab-relative ab-w-full ab-h-full">
      {showToolbar && (
        <div className="ab-flex ab-m-0 ab-p-1 ab-h-10 ab-sticky ab-top-0 ab-left-0 ab-w-full ab-z-40 ab-items-start ab-justify-start ab-ftr-active-menu-item">
          <ToolbarButton
            onClick={() => get()!.action(callCommand(wrapInHeadingCommand.key))}
            className="ab-p-0 ab-h-8"
            title="H1/Normal"
          >
            <Heading1 className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 2))
            }
            className="ab-p-0 ab-h-8"
            title="H2/Normal"
          >
            <Heading2 className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 3))
            }
            className="ab-p-0 ab-h-8"
            title="H3/Normal"
          >
            <Heading3 className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 4))
            }
            className="ab-p-0 ab-h-8"
            title="H4/Normal"
          >
            <Heading4 className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 5))
            }
            className="ab-p-0 ab-h-8"
            title="H5/Normal"
          >
            <Heading5 className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInHeadingCommand.key, 6))
            }
            className="ab-p-0 ab-h-8"
            title="H6/Normal"
          >
            <Heading6 className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <Separator
            orientation="vertical"
            className="!ab-w-1 !ab-h-6 !ab-m-1"
          />
          <ToolbarButton
            onClick={() => runCommand(toggleEmphasisCommand)}
            className="ab-p-0 ab-h-8"
            title="Italic/Normal"
          >
            <ItalicIcon className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(toggleStrongCommand)}
            className="ab-p-0 ab-h-8"
            title="Bold/Normal"
          >
            <BoldIcon className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(toggleStrikethroughCommand)}
            className="ab-p-0 ab-h-8"
            title="Strikethrough/Normal"
          >
            <Strikethrough className="ab-shrink-0 !ab-w-5 !ab-h-5" />
          </ToolbarButton>
          <Separator
            orientation="vertical"
            className="!ab-w-1 !ab-h-6 !ab-m-1"
          />
          <ToolbarButton
            onClick={() => runCommand(toggleLinkCommand)}
            className="ab-p-0 ab-h-8"
            title="Link/Unlink"
          >
            <LinkIcon className="ab-shrink-0 !ab-w-4 !ab-h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(toggleInlineCodeCommand)}
            className="ab-p-0 ab-h-8"
            title="Code/Normal"
          >
            <CodeIcon className="ab-shrink-0 !ab-w-4 !ab-h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(insertHrCommand)}
            className="ab-p-0 ab-h-8"
            title="Horizontal line/Normal"
          >
            <Ruler className="ab-shrink-0 !ab-w-4 !ab-h-4" />
          </ToolbarButton>
          <ToolbarButton
            onClick={() => runCommand(insertTableCommand)}
            className="ab-p-0 ab-h-8"
            title="Table"
          >
            <Table className="ab-shrink-0 !ab-w-4 !ab-h-4" />
          </ToolbarButton>

          <ToolbarButton
            onClick={() =>
              get()!.action(callCommand(wrapInBlockquoteCommand.key))
            }
            className="ab-p-0 ab-h-8"
            title="Blockquote/Normal"
          >
            <QuoteIcon className="ab-shrink-0 !ab-w-4 !ab-h-4" />
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
  onCreated,
}) => {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [value, setValue] = useState<string>(defaultValue);

  const handleChange = useCallback(
    (newValue: string) => {
      onChange?.(newValue);
      setValue(newValue);
    },
    [onChange],
  );

  const handleCreated = useCallback(
    (args: MilkdownEditorCreatedArgs) => {
      if (typeof onCreated === "function") {
        setEditor(args.editor);
        onCreated(args);
      }
    },
    [onCreated],
  );

  useEffect(() => {
    if (defaultValue && editor && value !== defaultValue) {
      editor.action(replaceAll(defaultValue));
      setValue(defaultValue);
    }
  }, [defaultValue, editor, value]);

  return (
    <MilkdownProvider>
      <ProsemirrorAdapterProvider>
        <input type="hidden" name={name} value={value} />
        <MilkdownEditor
          name={name}
          showToolbar={showToolbar}
          defaultValue={defaultValue}
          onChange={handleChange}
          onCreated={handleCreated}
          placeholder={placeholder}
        />
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  );
};
