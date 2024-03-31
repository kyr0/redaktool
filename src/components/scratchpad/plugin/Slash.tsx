import { editorViewCtx } from "@milkdown/core"
import { Ctx } from "@milkdown/ctx"
import { slashFactory, SlashProvider } from "@milkdown/plugin-slash"
import { createCodeBlockCommand } from "@milkdown/preset-commonmark"
import { useInstance } from '@milkdown/react'
import { callCommand } from "@milkdown/utils"
import { usePluginViewContext } from "@prosemirror-adapter/react"
import { useCallback, useEffect, useRef } from "react"

export const slash = slashFactory('Commands');

export const SlashView = () => {
    const ref = useRef<HTMLDivElement>(null)
    const slashProvider = useRef<SlashProvider>()

    const { view, prevState } = usePluginViewContext()
    const [loading, get] = useInstance()
    const action = useCallback((fn: (ctx: Ctx) => void) => {
        if (loading) return;
        get().action(fn)

        console.log('got action(fn)')
    }, [loading])

    useEffect(() => {
        const div = ref.current
        if (loading || !div) {
            return;
        }
        slashProvider.current = new SlashProvider({
            content: div,
            tippyOptions: {
                onMount: (_) => {
                    console.log('mounted SLASH')
                    ;(ref.current?.children[0] as HTMLButtonElement).focus();
                }
            }
        })

        return () => {
            console.log('unmount SLASH')
            slashProvider.current?.destroy()
        }
    }, [loading])

    useEffect(() => {
        slashProvider.current?.update(view, prevState)
    })

    const command = (e: React.KeyboardEvent | React.MouseEvent) => {
        e.preventDefault() // Prevent the keyboad key to be inserted in the editor.
        console.log('command!')
        action((ctx) => {

            console.log('action!')
            const view = ctx.get(editorViewCtx);
            const { dispatch, state } = view;
            const { tr, selection } = state;
            const { from } = selection;
            dispatch(tr.deleteRange(from - 1, from))
            view.focus()
            return callCommand(createCodeBlockCommand.key)(ctx)
        })
    }

    return (
        <div data-desc="This additional wrapper is useful for keeping slash component during HMR" aria-expanded="false" className="ab-relative">
            <div ref={ref} aria-expanded="false">
                <button
                    className="ab-text-gray-600 ab-bg-slate-200 ab-px-2 ab-py-1 ab-rounded-lg ab-hover:bg-slate-300 ab-border ab-hover:text-gray-900"
                    onKeyDown={(e) => command(e)}
                    onMouseDown={(e) => { command(e)}}
                >
                    Translate
                </button>
                <button
                    className="ab-text-gray-600 ab-bg-slate-200 ab-px-2 ab-py-1 ab-rounded-lg ab-hover:bg-slate-300 ab-border ab-hover:text-gray-900"
                    onKeyDown={(e) => command(e)}
                    onMouseDown={(e) => { command(e)}}
                >
                    Summarize
                </button>
            </div>
        </div>
    )
}
