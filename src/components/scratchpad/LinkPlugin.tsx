import { Plugin } from "@milkdown/prose/state";
import { DecorationSet } from "@milkdown/prose/view";
import { $prose } from "@milkdown/utils";
import type { useWidgetViewFactory } from "@prosemirror-adapter/react";
import { useWidgetViewContext } from "@prosemirror-adapter/react";
import clsx from "clsx";
import type { FC } from "react";
import { useCallback } from "react";
import { Button } from "../../ui/button";

export const useLinkClass = () => {
  return useCallback((isActive: boolean, bg = true) => {
    return clsx(
      bg &&
        (isActive
          ? "bg-nord8 dark:bg-nord9"
          : "hover:bg-gray-300 dark:hover:bg-gray-700"),
      isActive
        ? "fill-gray-900 text-gray-900 dark:fill-gray-50 dark:text-gray-50"
        : "fill-gray-600 text-gray-600 hover:fill-gray-900 hover:text-gray-900 dark:fill-gray-200 dark:text-gray-200 dark:hover:fill-gray-50 dark:hover:text-gray-50"
    );
  }, []);
};

export const LinkWidget: FC = () => {
    const { spec } = useWidgetViewContext();
    const href: string = spec?.href ?? "";
    const linkClass = useLinkClass();
    const isInnerLink: boolean = href.startsWith("#") || href.startsWith("/");
  
    const Component = isInnerLink ? Button : "a";
    const props = isInnerLink
      ? { href }
      : { href, target: "_blank", rel: "noreferrer" };
  
    return (
      <span className="not-prose">
        <Component
          {...props}
          className={clsx(
            "inline-flex items-center justify-center gap-1 rounded px-2",
            linkClass(false)
          )}
          onMouseDown={(e: any) => {
            e.preventDefault();
          }}
        >
          <span className="material-symbols-outlined text-sm text-nord8 ">
            open_in_new
          </span>
          <small className="font-light text-nord8">{href}</small>
        </Component>
      </span>
    );
  };
  
  export const linkPlugin = (
    widgetViewFactory: ReturnType<typeof useWidgetViewFactory>
  ) => {
    const widget = widgetViewFactory({ as: "span", component: LinkWidget });
  
    return $prose(
      () =>
        new Plugin({
          state: {
            init() {
              return DecorationSet.empty;
            },
            apply(tr) {
              const { selection } = tr;
  
              const { $from, $to } = selection;
              const node = tr.doc.nodeAt(selection.from);
  
              const mark = node?.marks.find((mark) => mark.type.name === "link");
  
              if (!mark) return DecorationSet.empty;
  
              let markPos = { start: -1, end: -1 };
              tr.doc.nodesBetween($from.start(), $to.end(), (n, pos) => {
                if (node === n) {
                  markPos = {
                    start: pos,
                    end: pos + Math.max(n.textContent.length, 1),
                  };
  
                  // stop recursing if result is found
                  return false;
                }
                return undefined;
              });
  
              return DecorationSet.create(tr.doc, [
                widget(markPos.end, {
                  href: mark.attrs.href,
                  title: mark.attrs.title,
                }),
              ]);
            },
          },
          props: {
            decorations(state) {
              return this.getState(state);
            },
          },
        })
    );
  };