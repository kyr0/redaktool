import("webextension-polyfill");

import {
  ANTHROPIC_API_KEY_NAME,
  OPEN_AI_API_KEY_NAME,
  PARTIAL_RESPONSE_NAME,
  PARTIAL_RESPONSE_TEXT_NAME,
} from "./shared";
import {
  systemPromptStreaming,
  type PromptTokenUsage,
} from "./lib/worker/llm/prompt";
import {
  compileSmartPrompt,
  getLastPartialPromptResponse,
  setLastPartialPromptResponse,
} from "./lib/worker/prompt";
import { dbGetValue, dbSetValue } from "./lib/worker/db";
import { fetchRssFeed } from "./lib/worker/rss";
import { cron } from "./lib/worker/scheduler";
import { getPref, getValue, setPref, setValue } from "./lib/worker/prefs";
import { whisper } from "./lib/worker/transcription/whisper";
import type {
  Prompt,
  PromptPartialResponse,
} from "./lib/content-script/prompt-template";
import { getLLMModel } from "./lib/content-script/llm-models";
import {
  calculateEffectivePrice,
  getPriceModel,
} from "./lib/content-script/pricemodels";

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
          const prompt = data as Prompt;
          console.log("prompt data", prompt);
          console.log("prompt", prompt.text);

          const model = getLLMModel(prompt.model);
          const costModel = getPriceModel(model.pk);

          console.log("model", model);
          let apiKey = "";

          switch (model.provider) {
            case "openai":
              apiKey = await getPref(OPEN_AI_API_KEY_NAME, "no-key");
              break;

            case "anthropic":
              apiKey = await getPref(ANTHROPIC_API_KEY_NAME, "no-key");
              console.log("anthropic key", apiKey);
              break;
          }

          let partialResponseText = "";

          systemPromptStreaming(
            prompt.text,
            model.provider,
            async (text: string, elapsed: number) => {
              // onChunk
              partialResponseText += text || "";

              const partialData: PromptPartialResponse =
                await getLastPartialPromptResponse(prompt.id);

              await setLastPartialPromptResponse(prompt.id, {
                ...partialData,
                text: partialResponseText,
                finished: false,
                elapsed,
              });

              //console.log("onChunk (internal)", text);
              setPref(PARTIAL_RESPONSE_TEXT_NAME, partialResponseText, false);
            },
            async (text: string, elapsed: number, usage: PromptTokenUsage) => {
              console.log("onDone (internal) elapsed", elapsed);

              const partialData: PromptPartialResponse =
                await getLastPartialPromptResponse(prompt.id);

              await setLastPartialPromptResponse(prompt.id, {
                ...partialData,
                text,
                actualUsage: usage,
                elapsed,
                totalPrice: calculateEffectivePrice(
                  costModel,
                  usage.prompt_tokens || 0,
                  usage.completion_tokens || 0,
                ).total,
                finished: true,
              });

              // onDone
              sendResponse({ result: JSON.stringify(partialResponseText) });
              setPref(PARTIAL_RESPONSE_TEXT_NAME, "", false); // reset/clear
            },
            async (error: unknown, elapsed: number) => {
              // TODO: respond with error return type

              const partialData: PromptPartialResponse =
                await getLastPartialPromptResponse(prompt.id);

              await setLastPartialPromptResponse(prompt.id, {
                ...partialData,
                errorMessage: error
                  ? (error as Error).message
                  : "Unknown error",
                finished: true,
                elapsed,
              });
              sendResponse({ result: JSON.stringify("") });

              // onError
              console.error("onError (internal)", error);
              setPref(PARTIAL_RESPONSE_TEXT_NAME, "", false); // reset/clear
            },
            {
              model: model.ident,
              max_tokens: costModel.maxOutputTokens,
              temperature: 0.7, // TODO: dynamically from settings
              n: 1,
            },
            {
              apiKey,
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
