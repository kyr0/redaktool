import { PARTIAL_RESPONSE_TEXT_NAME } from "../../shared";
import { prefChrome } from "./prefs";

export const sendPrompt = (
  prompt: string,
  onChunk: (text: string) => void,
  onDone: (lastChunkText: string) => void,
) => {
  let state = "";

  const updateStream = setInterval(async () => {
    try {
      const partial = (await prefChrome(PARTIAL_RESPONSE_TEXT_NAME).get(
        false,
      )) as string;

      onChunk(partial.slice(state.length));

      state = partial;
    } catch (error) {
      // ignore
      console.error("updateStream error", error);
    }
  }, 250);

  chrome.runtime.sendMessage(
    {
      action: "prompt",
      text: JSON.stringify({
        prompt,
      }),
    },
    (response) => {
      const resultText = JSON.parse(response.result);

      onDone(resultText.slice(state.length));

      state = "";

      clearInterval(updateStream);
    },
  );
};
