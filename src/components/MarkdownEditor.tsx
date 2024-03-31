import { defaultValueCtx, Editor, rootCtx, commandsCtx, editorViewOptionsCtx, rootAttrsCtx, SchemaReady } from '@milkdown/core';
import { createSlice, type MilkdownPlugin } from '@milkdown/ctx';
import { blockquoteSchema, headingSchema } from '@milkdown/preset-commonmark';
import { $command, callCommand } from '@milkdown/utils';
import { setBlockType, wrapIn } from '@milkdown/prose/commands';
import { nord } from '@milkdown/theme-nord';
import { Milkdown, MilkdownProvider, useEditor, useInstance } from '@milkdown/react';
import { commonmark, toggleEmphasisCommand, toggleStrongCommand, toggleInlineCodeCommand, toggleLinkCommand, insertHrCommand,  } from '@milkdown/preset-commonmark';
import { gfm, toggleStrikethroughCommand, insertTableCommand } from '@milkdown/preset-gfm';
import { history as proseHistory } from '@milkdown/plugin-history';
import { clipboard } from '@milkdown/plugin-clipboard';
import { cursor } from '@milkdown/plugin-cursor';
import { emoji } from '@milkdown/plugin-emoji';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BoldIcon, CodeIcon, Heading1, Heading2, Heading3, Heading4, Heading5, Heading6, ItalicIcon, LinkIcon, QuoteIcon, Ruler, Strikethrough, Table } from 'lucide-react';
import { Button } from '../ui/button';
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import {
  placeholder as placeholderPlugin,
  placeholderCtx,
} from "milkdown-plugin-placeholder";
import { ProsemirrorAdapterProvider, usePluginViewFactory } from "@prosemirror-adapter/react";
import { atom } from 'nanostores';
import { useStore } from "@nanostores/react"
import { insertTextPlugin } from './scratchpad/plugin/InsertText';
import { selectEditorContent } from '../lib/content-script/clipboard';
//import { SlashView, slash } from './scratchpad/plugin/Slash';

export interface MilkdownInternalProps {
  defaultValue: string;
  placeholder?: string;
  onChange: (newValue: string) => void;
}

export type MarkdownEditorProps = MilkdownInternalProps & {
  name: string;
  showToolbar?: boolean;
}

// custom commands
const wrapInBlockquoteCommand = $command('WrapInBlockquote', (ctx) => () => wrapIn(blockquoteSchema.type(ctx)));
const wrapInHeadingCommand = $command('WrapInHeading', (ctx) => (level = 1) => setBlockType(headingSchema.type(ctx), { level }));

const ToolbarButton = ({ onClick, title, children, className }: any) => (
  <Button
    onClick={onClick}
    className={"ab-h-[30px] ab-w-[30px] ab-p-1 ab-m-1" + " " + className}
    variant={"ghost"}
    title={title}
  >
    {children}
  </Button>
);

export const milkdownEditorAtom = atom<Record<string, Editor> | null>({})
export const getMilkdownEditorStore = () => useStore(milkdownEditorAtom)

const MilkdownEditor: React.FC<MarkdownEditorProps> = ({
  name,
  defaultValue = "",
  showToolbar,
  placeholder,
  onChange,
}: MarkdownEditorProps) => {

    //const pluginViewFactory = usePluginViewFactory();

    const { get, loading } = useEditor((root) => {
      
        const editor = Editor
            .make()
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
                  class: "ab-outline-none ab-h-full ab-overflow-scroll",
                },
              }));
              
              ctx.update(rootAttrsCtx, (prev) => ({ ...prev, class: "ab-h-full ab-overflow-scroll" }));
    
              const listener = ctx.get(listenerCtx);

              console.log('listener', listener)
              console.log('ctx', ctx)
              console.log('rootCtx', rootCtx)
              console.log('editorViewOptionsCtx', editorViewOptionsCtx)

              listener.markdownUpdated((_ctx, markdown, prevMarkdown) => {
                if (markdown !== prevMarkdown) {
                  onChange(markdown);
                }
              });
            }) 
            .config(nord)
            //.use(slash)
            //.use(examplePlugin)
            .use(listener)
            .use(placeholderPlugin)
            .use(wrapInBlockquoteCommand)
            .use(wrapInHeadingCommand)
            .use(commonmark)
            .use(gfm)
            .use(clipboard)
            .use(cursor)
            .use(emoji)
            .use(insertTextPlugin)
            .use(proseHistory)
            //.use([remarkDirective, directiveNode, inputRule])
            //.use(linkPlugin(widgetViewFactory));
        
        // register in editor reference registry
        milkdownEditorAtom.set({ ...milkdownEditorAtom.get(), [name]: editor })

        return editor;
    }, [onChange, placeholder]
  );

  const runCommand = (command: any) => {
    if (!get()) return;
    get()!.action((ctx) => {
      ctx.get(commandsCtx).call(command.key);
    });
  }

  return (<div className='ab-relative ab-w-full ab-h-full'>
      {showToolbar && (
        <div className="ab-flex ab-m-1 ab-h-[30px] ab-mt-1 ab-sticky ab-top-0 ab-left-0 ab-w-full ab-z-40  ab-items-start ab-justify-start">

            <ToolbarButton onClick={() => get()!.action(callCommand(wrapInHeadingCommand.key))} title="H1/Normal">
              <Heading1 className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => get()!.action(callCommand(wrapInHeadingCommand.key, 2))} title="H2/Normal">
              <Heading2 className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => get()!.action(callCommand(wrapInHeadingCommand.key, 3))} title="H2/Normal">
              <Heading3 className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => get()!.action(callCommand(wrapInHeadingCommand.key, 4))} title="H2/Normal">
              <Heading4 className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => get()!.action(callCommand(wrapInHeadingCommand.key, 5))} title="H2/Normal">
              <Heading5 className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => get()!.action(callCommand(wrapInHeadingCommand.key, 6))} title="H2/Normal">
              <Heading6 className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => runCommand(toggleEmphasisCommand)} title="Italic/Normal">
              <ItalicIcon className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => runCommand(toggleStrongCommand)} title="Bold/Normal">
              <BoldIcon className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => runCommand(toggleStrikethroughCommand)} title="Bold/Normal">
              <Strikethrough className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => runCommand(toggleLinkCommand)} title="Link/Unlink">
              <LinkIcon className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton  onClick={() => runCommand(toggleInlineCodeCommand)} title="Code/Normal">
              <CodeIcon className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton onClick={() => runCommand(insertHrCommand)} title="Horizontal line/Normal">
              <Ruler className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
            <ToolbarButton  onClick={() => runCommand(insertTableCommand)} title="Horizontal line/Normal">
              <Table className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>

            <ToolbarButton onClick={() => get()!.action(callCommand(wrapInBlockquoteCommand.key))} title="Blockquote/Normal">
              <QuoteIcon className='ab-shrink-0 ab-w-4 ab-h-4' />
            </ToolbarButton>
        </div>
      )}
      <div data-editor-name={name} className='ab-pl-1 ab-pr-1 ab-h-full ab-ml-1 ab-mr-1'>
        <Milkdown />
      </div>
  </div>);
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
          placeholder={placeholder} />
      </ProsemirrorAdapterProvider>
    </MilkdownProvider>
  );
};


export const markdownDefaultContent =
`# An exhibit of Markdown

This note demonstrates some of what [Markdown][1] is capable of doing.

*Note: Feel free to play with this page. Unlike regular notes, this doesn't automatically save itself.*

## Basic formatting

Paragraphs can be written like so. A paragraph is the basic block of Markdown. A paragraph is what text will turn into when there is no reason it should become anything else.

Paragraphs must be separated by a blank line. Basic formatting of *italics* and **bold** is supported. This *can be **nested** like* so.

## Lists

### Ordered list

1. Item 1
2. A second item
3. Number 3
    1. sub
    2. list
4. Ⅳ
5. und
  * noch
  * mehr
6. weiter

*Note: the fourth item uses the Unicode character for [Roman numeral four][2].*

### Unordered list

* An item
* Another item
* Yet another item
* test
  * test2
  * An item
  * Another item
    * blub
  * narf
* bla

## Checklist

- [ ] a bigger project
  - [ ] first subtask #1234
  - [x] follow up subtask #4321
  - [x] final subtask cc @mention
- [ ] a separate task

## Paragraph modifiers

### Code block

    Code blocks are very useful for developers and other people who look at code or other things that are written in plain text. As you can see, it uses a fixed-width font.

You can also make \`inline code\` to add code into other things.

\`\`\`javascript
// This function returns a string padded with leading zeros
function padZeros(num, totalLen) {
    var numStr = num.toString();             // Initialize return value as string
    var numZeros = totalLen - numStr.length; // Calculate no. of zeros
    for (var i = 1; i <= numZeros; i++) {
      numStr = "0" + numStr;
    }
    return numStr;
}
\`\`\`

## ASCII art

# ○◻◊◇◆■▥▤🗹🗷🗸🗶🖕🕱🌢🏶🕆🕇🕀🖸🖫🗐🖹🗅🖉

<pre>
              ,-. 
    ,     ,-.   ,-. 
    / \   (   )-(   ) 
    \ |  ,.>-(   )-< 
    \|,' (   )-(   ) 
      Y ___\`-'   \`-' 
      |/__/   \`-' 
      | 
      | 
      |    -hrr- 
  ___|_____________ 
</pre>

### Quote

> Here is a quote. What this is should be self explanatory. Quotes are automatically indented when they are used.

## Headings

There are six levels of headings. They correspond with the six levels of HTML headings. You've probably noticed them already in the page. Each level down uses one more hash character.

### Headings *can* also contain **formatting**

### They can even contain \`inline code\`

Of course, demonstrating what headings look like messes up the structure of the page.

I don't recommend using more than three or four levels of headings here, because, when you're smallest heading isn't too small, and you're largest heading isn't too big, and you want each size up to look noticeably larger and more important, there there are only so many sizes that you can use.

## URLs

URLs can be made in a handful of ways:

* A named link to [MarkItDown][3]. The easiest way to do these is to select what you want to make a link and hit \`Ctrl+L\`.
* Another named link to [MarkItDown](http://www.markitdown.net/)
* Sometimes you just want a URL like <http://www.markitdown.net/>.

## Horizontal rule

A horizontal rule is a line that goes across the middle of the page.

---

It's sometimes handy for breaking things up.

## Tables

| Name | Description          |
| ------------- | ----------- |
| Help      | ~~Display the~~ help window.|
| Close     | _Closes_ a window     |

Finally, by including colons : within the header row, you can define text to be left-aligned, right-aligned, or center-aligned:

| Left-Aligned  | Center Aligned  | Right Aligned |
| :------------ |:---------------:| -----:|
| col 3 is      | some wordy text | $1600 |
| col 2 is      | centered        |   $12 |
| zebra stripes | are neat        |    $1 |

## Images

![Image of flowers](https://c1.staticflickr.com/1/675/22381378833_c35b2fdd75_n.jpg)

## Finally

There's actually a lot more to Markdown than this :camel:. See the official [introduction][4] and [syntax][5] for more information. However, be aware that this is not using the official implementation, and this might work subtly differently in some of the little things.

[1]: http://daringfireball.net/projects/markdown/
[2]: http://www.fileformat.info/info/unicode/char/2163/index.htm
[3]: http://www.markitdown.net/
[4]: http://daringfireball.net/projects/markdown/basics
[5]: http://daringfireball.net/projects/markdown/syntax`
