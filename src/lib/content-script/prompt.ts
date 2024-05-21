import { PARTIAL_RESPONSE_TEXT_NAME } from "../../shared";
import { prefChrome } from "./prefs";

export const sendPrompt = (
  prompt: string,
  onChunk: (text: string) => void,
  onDone: (lastChunkText: string) => void,
) => {
  const updateStream = setInterval(async () => {
    try {
      onChunk(
        (await prefChrome(PARTIAL_RESPONSE_TEXT_NAME).get(false)) as string,
      );
    } catch (error) {
      // ignore
    }
  }, 500);

  chrome.runtime.sendMessage(
    {
      action: "prompt",
      text: JSON.stringify({
        prompt,
      }),
    },
    (response) => {
      const resultText = JSON.parse(response.result);

      onDone(resultText);

      clearInterval(updateStream);
    },
  );
};
