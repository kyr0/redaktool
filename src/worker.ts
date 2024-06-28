import("webextension-polyfill");

import { OPEN_AI_API_KEY_NAME, PARTIAL_RESPONSE_TEXT_NAME } from "./shared";
import { systemPromptStreaming } from "./lib/worker/llm/prompt";
import { compileSmartPrompt } from "./lib/worker/prompt";
import { dbGetValue, dbSetValue } from "./lib/worker/db";
import { fetchRssFeed } from "./lib/worker/rss";
import { cron } from "./lib/worker/scheduler";
import { getPref, getValue, setPref, setValue } from "./lib/worker/prefs";
import { whisper } from "./lib/worker/transcription/whisper";
import type { Prompt } from "./lib/content-script/prompt-template";

// inject the activate.js script into the current tab
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    files: ["dist/activate.js"],
  });
});

//
const job = cron(() => {
  console.log("cron job");
}, 60);
job.runNow();

// TODO: Archive with IndexedDB and Vector Embeddings

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);

  (async () => {
    console.log(
      "worker script loaded",
      await getPref(OPEN_AI_API_KEY_NAME, "no-key"),
    );

    /*
    const client = new OpenAIClient({
      apiKey: await getPref(OPEN_AI_API_KEY_NAME, "no-key"),
    });
    */

    // Process the message
    if (request.action && request.text) {
      const data = JSON.parse(request.text);

      // Example processing: log action and text
      console.log("Action:", request.action);
      console.log("Data:", JSON.stringify(data));
      console.log("Data (parsed):", data);

      switch (request.action) {
        case "db-get": {
          const result = await dbGetValue(data.key);
          sendResponse({ success: true, value: JSON.stringify(result) });
          break;
        }

        case "db-set": {
          const pk = await dbSetValue(data.key, data.value);
          sendResponse({ success: true, value: JSON.stringify({ pk }) });
          break;
        }

        // persistent value storage: get
        case "get":
          try {
            const value = await getValue(
              data.key,
              undefined,
              data.local === false ? false : true,
            );

            console.log("GET", data.key, value);
            sendResponse({ success: true, value: JSON.stringify(value) });
          } catch (error) {
            sendResponse({ success: false, value: undefined });
          }
          break;

        // persistent value storage: set
        case "set":
          console.log("SET", data.key, data.value);
          await setValue(
            data.key,
            data.value,
            data.local === false ? false : true,
          );
          sendResponse({ success: true });
          break;

        // multi-provider LLM prompt processing
        case "prompt": {
          // TODO: define a "pipeline" for each prompt to run in parallel

          const prompt = data as Prompt;
          console.log("prompt data", prompt);
          console.log("prompt", prompt.text);

          let partialResponseText = "";

          systemPromptStreaming(
            prompt.text,
            "openai", // TODO: transmit model name and resolve provider here
            (text: string) => {
              // onChunk
              partialResponseText += text || "";
              //console.log("onChunk (internal)", text);
              setPref(PARTIAL_RESPONSE_TEXT_NAME, partialResponseText, false);
            },
            (elapsed: number) => {
              console.log("onDone (internal) elapsed", elapsed);
              // onDone
              sendResponse({ result: JSON.stringify(partialResponseText) });
              setPref(PARTIAL_RESPONSE_TEXT_NAME, "", false); // reset/clear
            },
            (error: unknown) => {
              // TODO: respond with error return type

              // onError
              console.error("onError (internal)", error);
              setPref(PARTIAL_RESPONSE_TEXT_NAME, "", false); // reset/clear
            },
            {
              model: "gpt-4o", // TODO: select dynamically, depending on provider and pass settings
              temperature: 0.7, // TODO: dynamically from settings
              n: 1,
            },
            {
              apiKey: await getPref(OPEN_AI_API_KEY_NAME, "no-key"),
            },
          );
          break;
        }

        // compilation of smart prompt; handled in worker process for security context separation and for performance
        case "compile-prompt": {
          const compileResult = compileSmartPrompt(
            data.promptTemplate,
            data.inputValues,
          );

          console.log("compileResult", compileResult);
          sendResponse({
            success: compileResult.error ? false : true,
            value: JSON.stringify(compileResult),
          });
          break;
        }

        // whisper audio transcription
        case "transcribe": {
          console.log("prompt", data.blobDataUrl);

          const base64Data = data.blobDataUrl.split(",")[1];
          const response = await fetch(`data:text/plain;base64,${base64Data}`);
          const blob: Blob = await response.blob();

          console.log("blob", blob);

          const whisperResponse = await whisper(blob);
          sendResponse({
            success: true,
            value: JSON.stringify(whisperResponse),
          });
          break;
        }

        // news radar rss feed fetching
        case "rss": {
          console.log("rssFeedUrl", data.rssFeedUrl);
          const feedItems = await fetchRssFeed(data.rssFeedUrl);
          sendResponse({ success: true, feed: JSON.stringify(feedItems) });
          break;
        }
      }
    }
  })();
  return true; // allow async response
});
