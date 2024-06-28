import { PARTIAL_RESPONSE_TEXT_NAME } from "../../shared";
import { prefChrome } from "./prefs";
import type { Prompt } from "./prompt-template";

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
  onDone: (lastChunkText: string) => void,
) => {
  let state = "";

  const updateStream = setInterval(async () => {
    try {
      const partial =
        ((await prefChrome(PARTIAL_RESPONSE_TEXT_NAME).get(false)) as string) ||
        "";

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
      text: JSON.stringify(prompt),
    },
    (response) => {
      const resultText = JSON.parse(response.result) || "";

      onDone(resultText.slice(state.length));

      state = "";

      clearInterval(updateStream);
    },
  );
};
