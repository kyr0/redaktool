import {
    commandsCtx,
    CommandsReady,
    createCmdKey,
} from "@milkdown/core";
import type { MilkdownPlugin } from "@milkdown/ctx";
  
export const InsertText = createCmdKey();

export const insertTextPlugin: MilkdownPlugin = (ctx) => {
    // #1 prepare plugin
    return async () => {
      // #2 run plugin
      await ctx.wait(CommandsReady);
      const commandManager = ctx.get(commandsCtx);

      commandManager.create(InsertText, () => {
          return (state, dispatch) => {
              if (!dispatch) return false;
              const { tr } = state;
              dispatch(tr.insertText("hello\n\nhello"));
              return true;
          };
      });
        
      return async () => {
        // #3 clean up plugin
      }
    };
  };