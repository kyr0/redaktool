import { commandsCtx } from "@milkdown/core";
import { BlockProvider } from "@milkdown/plugin-block";
import {
  turnIntoTextCommand,
  wrapInHeadingCommand,
} from "@milkdown/preset-commonmark";
import { useInstance } from "@milkdown/react";
import { usePluginViewContext } from "@prosemirror-adapter/react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";

export const Block = () => {
  const { view } = usePluginViewContext();
  const blockProvider = useRef<BlockProvider>();
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [loading, get] = useInstance();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (element && !loading) {
      blockProvider.current ??= new BlockProvider({
        ctx: get().ctx,
        content: element,
        tippyOptions: {
          zIndex: 20,
          appendTo: document.body,
          onBeforeUpdate: () => setShowMenu(false),
          onClickOutside: () => setShowMenu(false),
          onHide: () => setShowMenu(false),
        },
      });
    }

    return () => {
      blockProvider?.current?.destroy();
    };
  }, [loading, get, element]);

  useEffect(() => {
    blockProvider.current?.update(view);
  });

  return (
    <div className="hidden">
      <div
        className={clsx(
          "ab-relative ab-cursor-grab ab-rounded-full ab-border-2 ab-bg-gray-50 dark:ab-border-gray-900 dark:ab-bg-gray-900",
          showMenu ? "ab-ring-2 ab-ring-offset-2" : "",
        )}
        ref={setElement}
      >
        <div onClick={() => setShowMenu((x) => !x)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="ab-h-5 ab-w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
            />
          </svg>
        </div>
        {showMenu && (
          <div className="ab-absolute ab-top-full ab-mt-2 ab-w-60 ab-cursor-pointer ab-rounded ab-border-2 ab-bg-gray-50 ab-shadow dark:ab-border-gray-900 dark:ab-bg-gray-900">
            <div
              onClick={() => {
                if (loading) return;

                const commands = get().ctx.get(commandsCtx);
                commands.call(wrapInHeadingCommand.key, 1);
              }}
              className="ab-px-6 ab-py-3 hover:ab-bg-gray-200 dark:ab-hover:bg-gray-700"
            >
              Heading 1
            </div>
            <div
              onClick={() => {
                if (loading) return;

                const commands = get().ctx.get(commandsCtx);
                commands.call(wrapInHeadingCommand.key, 2);
              }}
              className="ab-px-6 ab-py-3 hover:ab-bg-gray-200 dark:hover:ab-bg-gray-700"
            >
              Heading 2
            </div>
            <div
              onClick={() => {
                if (loading) return;

                const commands = get().ctx.get(commandsCtx);
                commands.call(wrapInHeadingCommand.key, 3);
              }}
              className="ab-px-6 ab-py-3 hover:ab-bg-gray-200 dark:hover:ab-bg-gray-700"
            >
              Heading 3
            </div>
            <div
              onClick={() => {
                if (loading) return;

                const commands = get().ctx.get(commandsCtx);
                commands.call(turnIntoTextCommand.key);
              }}
              className="ab-px-6 ab-py-3 hover:ab-bg-gray-200 dark:hover:ab-bg-gray-700"
            >
              Text
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
