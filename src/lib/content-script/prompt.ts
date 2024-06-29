import {
  PARTIAL_RESPONSE_NAME,
  PARTIAL_RESPONSE_TEXT_NAME,
} from "../../shared";
import type { PromptTokenUsage } from "../worker/llm/prompt";
import { db } from "./db";
import { prefChrome } from "./prefs";
import type { Prompt, PromptPartialResponse } from "./prompt-template";

export const mapUserLanguageCode = (code: string): string => {
  code = code.toUpperCase();
  switch (code) {
    case "EN":
      return "English";

    case "DE":
      return "German";
  }
  return code;
};

export const sendPrompt = (
  prompt: Prompt,
  onChunk: (text: string) => void,
  onDone: (wholeText: string, usage: PromptTokenUsage) => void,
  onError: (error: string) => void,
) => {
  //let state = "";
  let stateNew = "";
  let streamStopped = false;

  console.log("sendPrompt", prompt);
  const { get } = db<string | undefined>(
    `${PARTIAL_RESPONSE_NAME}_${prompt.id}`,
  );

  const getPartialResponse =
    async (): Promise<PromptPartialResponse | null> => {
      const data = await get();
      if (!data) return null;
      return JSON.parse(data) as PromptPartialResponse;
    };

  const updateStream = setInterval(() => {
    (async () => {
      console.log("updateStream");
      const partialDb = await getPartialResponse();
      try {
        /*
      const partial =
        ((await prefChrome(PARTIAL_RESPONSE_TEXT_NAME).get(false)) as string) ||
        "";
      */
        const partialDbText = partialDb?.text || "";

        console.log("partialDb", partialDb);

        //console.log("slice old", `'${partial.slice(state.length)}'`);
        console.log("slice new", `'${partialDbText.slice(stateNew.length)}'`);

        onChunk(partialDbText.slice(stateNew.length));
        //onChunk(partial.slice(state.length));

        //state = partial;
        stateNew = partialDbText;
      } catch (error) {
        console.error("updateStream error", error);
        onError((error as Error).message);
        clearInterval(updateStream);
      }
    })();
  }, 250);

  chrome.runtime.sendMessage(
    {
      action: "prompt",
      text: JSON.stringify(prompt),
    },
    (response) => {
      // stopped the stream
      if (streamStopped) {
        return;
      }

      (async () => {
        const partialDb = await getPartialResponse();
        const partialDbText = partialDb?.text || "";

        if (partialDb?.errorMessage) {
          onError(partialDb.errorMessage);
          clearInterval(updateStream);
          return;
        }

        console.log("done slice new", partialDbText.slice(stateNew.length));

        onDone(partialDbText, partialDb!.actualUsage!);
        console.log("partialDb (on response)", partialDb);

        stateNew = "";
        console.log("done");

        clearInterval(updateStream);
      })();

      //const resultText = JSON.parse(response.result) || "";

      //console.log("done slice old", resultText.slice(state.length));
      //onDone(resultText.slice(state.length));

      //state = "";
    },
  );

  return {
    stopStream: () => {
      streamStopped = true;
      console.log("stopStream");
      clearInterval(updateStream);
    },
  };
};
