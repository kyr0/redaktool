// DEPRECATED
//import("webextension-polyfill");

import {
  ANTHROPIC_API_KEY_NAME,
  OPEN_AI_API_KEY_NAME,
  type MLModel,
  type MessageChannelPackage,
  type MessageChannelMessage,
  type DbKeyValue,
} from "./shared";
import {
  promptStreaming,
} from "./lib/worker/llm/prompt";
import type { PromptTokenUsage, PromptCallSettings, InferenceProviderType } from "./lib/worker/llm/interfaces";
import {
  compileSmartPrompt,
  getLastPartialPromptResponse,
  setLastPartialPromptResponse,
} from "./lib/worker/prompt";
import { db, dbGetValue, dbSetValue } from "./lib/worker/db";
import { fetchRssFeed } from "./lib/worker/rss";
import { cron } from "./lib/worker/scheduler";
import { getPref, getValue, setValue } from "./lib/worker/prefs";
import { whisper } from "./lib/worker/transcription/whisper";
import type {
  CompilePrompt,
  Prompt,
  PromptPartialResponse,
} from "./lib/content-script/prompt-template";
import { getLLMModel } from "./lib/content-script/llm-models";
/*
import {
  calculateEffectivePrice,
  getPriceModel,
} from "./lib/content-script/pricemodels";
 */
import { useMessageChannel } from "./lib/worker/message-channel";
import { loadEmbeddingModel } from "./lib/worker/embedding/model";

// establish fast, MessageChannel-based communication between content script and worker
const { postMessage, addListener } = useMessageChannel<MessageChannelMessage>();

// instant memory/heap reference pub/sub messaging
addListener(async(e) => {
  console.log("worker message", e.data);
  switch (e.data.action) {
    case "model": {
      const model = e.data.payload as MLModel;
      loadEmbeddingModel(model);
      break;
    }

    // TODO: 
    /*
    case "compile-prompt": {

      const compilePrompt = e.data.payload as CompilePrompt;
      console.log("compile-prompt2", e.data.payload);

      try {
        const compileResult = compileSmartPrompt(
          compilePrompt.promptTemplate,
          compilePrompt.inputValues,
        );

        console.log("compileResult2", compileResult);

        if (compileResult.error) {
          postMessage({
            id: e.data.id,
            success: false,
            error: compileResult.error,
            action: "compile-prompt-result",
            payload: compileResult
          })
        } else {
          postMessage({
            id: e.data.id,
            success: true,
            action: "compile-prompt-result",
            payload: compileResult
          })
        }
      } catch (error) {
        console.log("compile prompt error", e.data.payload, error);
        postMessage({
          id: e.data.id,
          success: false,
          error,
          action: "compile-prompt-result",
          payload: compilePrompt 
        })
      }
      break;
    }
    */

    /*
    case "db-get": {
      console.log("db-get2", e.data.payload);
      const dbKeyValue = e.data.payload as DbKeyValue;
      console.log("dbKeyValue2", dbKeyValue);
      try {
        const data = await dbGetValue(dbKeyValue.key);
        console.log("data2", dbKeyValue, data);
        postMessage({
          id: e.data.id,
          success: true,
          action: "db-get-result",
          payload: { key: dbKeyValue.key, value: data ? JSON.parse(data) : undefined }
        })
      } catch (error) {
        console.log("db-get error", dbKeyValue, error);
        postMessage({
          id: e.data.id,
          success: false,
          error,
          action: "db-get-result",
          payload: { key: dbKeyValue.key, value: undefined }
        })
      }
      break;
    }

    case "db-set": {
      console.log("db-set2", e.data.payload);
      const dbKeyValue = e.data.payload as DbKeyValue;
      console.log("dbKeyValue2", dbKeyValue);
      try {

        const pk = await dbSetValue(dbKeyValue.key, JSON.stringify(dbKeyValue.value));
        console.log("db-set", e.data.payload);
        console.log("data2", dbKeyValue);
        postMessage({
          id: e.data.id,
          success: true,
          action: "db-set-result",
          payload: { key: dbKeyValue.key, value: pk }
        })
      } catch (error) {
        console.log("db-set error", dbKeyValue, error);
        postMessage({
          id: e.data.id,
          success: false,
          error,
          action: "db-set-result",
          payload: { key: dbKeyValue.key, value: undefined }
        })
      }
      break;
    }
    */

    case "prompt": {
      console.log("prompt", e.data.payload);
    }
  }
});

// inject the activate.js script into the current tab
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    files: ["assets/activate.js"],
  });
});

//
const job = cron(() => {
  console.log("cron job");
}, 60);
job.runNow();

// TODO: Archive with IndexedDB and Vector Embeddings

// dead port tracking
const portsDisconnected = new WeakSet();

chrome.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener((message) => {
    switch (message.action) {
      case "prompt": {
        const prompt = message.payload as Prompt;
        console.log("prompt", prompt);

        console.log("prompt data", prompt);
        console.log("prompt", prompt.text);

        const advancedHyperParameters: Partial<Omit<PromptCallSettings, "model">> =
          {};

        if (typeof prompt.hyperParameters?.autoTuneCreativity === "number") {
          advancedHyperParameters.temperature =
            (prompt.hyperParameters?.autoTuneCreativity / 100)
        }

        switch (prompt.inferenceProvider) {
          case "openai":
            
            if (typeof prompt.hyperParameters?.autoTuneFocus === "number") {
              advancedHyperParameters.presencePenalty =
                (prompt.hyperParameters?.autoTuneGlossary / 100) * 2;
            }

            if (
              typeof prompt.hyperParameters?.autoTuneGlossary === "number"
            ) {
              advancedHyperParameters.frequencyPenalty =
                (prompt.hyperParameters?.autoTuneFocus / 100) * 2;
            }
            break;

          case "anthropic":
            console.log("anthropic key", prompt.apiOptionsOverrides?.apiKey);
            break;
        }

        console.log("advancedHyperParameters", advancedHyperParameters);

        promptStreaming(
          prompt.model,
          prompt.text,
          prompt.inferenceProvider as InferenceProviderType,
          async (text: string, elapsed: number) => {
            console.log("onChunk STREAM (internal) elapsed", elapsed);

            if (portsDisconnected.has(port)) {
              return;
            }
            port.postMessage({
              action: "prompt-response",
              payload: {
                id: prompt.id,
                text,
                elapsed,
                finished: false,
              },
            })
          },
          async (text: string, elapsed: number, usage: PromptTokenUsage) => {
            console.log("onDone STREAM (internal) elapsed", elapsed);

            if (portsDisconnected.has(port)) {
              return;
            }

            port.postMessage({
              action: "prompt-response",
              payload: {
                id: prompt.id,
                text,
                elapsed,
                actualUsage: usage,
                finished: true,
              },
            })
          },
          async (error: unknown, elapsed: number) => {
            console.log("onError STREAM (internal) elapsed", elapsed);

            if (portsDisconnected.has(port)) {
              return;
            }

            port.postMessage({
              action: "prompt-response",
              payload: {
                id: prompt.id,
                error,
                elapsed,
                finished: true,
              },
            })
          },
          {
            // union of parameters passed down, mapped internally
            ...advancedHyperParameters,
            ...(prompt.settingsOverrides || {}),
          },
          {
            // union of options passed down, mapped internally
            ...(prompt.apiOptionsOverrides || {}),
            // auto-tuning of hyperparameters
            //autoTuneCreativity: prompt.autoTuneCreativity || 0.7,
            //autoTuneFocus: prompt.autoTuneFocus || undefined,
            //autoTuneGlossary: prompt.autoTuneGlossary || undefined,
          },
        );
        break;
      }
    }
  });

  port.onDisconnect.addListener(() => {
    portsDisconnected.add(port);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Received message:", request);

  (async () => {
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
              data.local !== false,
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
          await setValue(data.key, data.value, data.local !== false);
          sendResponse({ success: true });
          break;

        // multi-provider LLM prompt processing
        case "prompt": {
          const prompt = data as Prompt;
          console.log("prompt data", prompt);
          console.log("prompt", prompt.text);

          const advancedHyperParameters: Partial<Omit<PromptCallSettings, "model">> =
            {};

          if (typeof prompt.hyperParameters?.autoTuneCreativity === "number") {
            advancedHyperParameters.temperature =
              (prompt.hyperParameters?.autoTuneCreativity / 100)
          }

          switch (prompt.inferenceProvider) {
            case "openai":
              
              if (typeof prompt.hyperParameters?.autoTuneFocus === "number") {
                advancedHyperParameters.presencePenalty =
                  (prompt.hyperParameters?.autoTuneGlossary / 100) * 2;
              }

              if (
                typeof prompt.hyperParameters?.autoTuneGlossary === "number"
              ) {
                advancedHyperParameters.frequencyPenalty =
                  (prompt.hyperParameters?.autoTuneFocus / 100) * 2;
              }
              break;

            case "anthropic":
              console.log("anthropic key", prompt.apiOptionsOverrides?.apiKey);
              break;
          }

          console.log("advancedHyperParameters", advancedHyperParameters);
          let partialResponseText = "";

          promptStreaming(
            prompt.model,
            prompt.text,
            prompt.inferenceProvider as InferenceProviderType,
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
              //setPref(PARTIAL_RESPONSE_TEXT_NAME, partialResponseText, false);
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
                totalPrice: /*calculateEffectivePrice(
                  costModel,
                  usage.promptTokens || 0,
                  usage.completionTokens || 0,
                ).total*/ 0,
                finished: true,
              });

              // onDone
              sendResponse({ result: JSON.stringify(partialResponseText) });
              // setPref(PARTIAL_RESPONSE_TEXT_NAME, "", false); // reset/clear
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
              //  setPref(PARTIAL_RESPONSE_TEXT_NAME, "", false); // reset/clear
            },
            {
              // union of parameters passed down, mapped internally
              ...advancedHyperParameters,
              ...(prompt.settingsOverrides || {}),
            },
            {
              // union of options passed down, mapped internally
              ...(prompt.apiOptionsOverrides || {}),
              // auto-tuning of hyperparameters
              //autoTuneCreativity: prompt.autoTuneCreativity || 0.7,
              //autoTuneFocus: prompt.autoTuneFocus || undefined,
              //autoTuneGlossary: prompt.autoTuneGlossary || undefined,
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
            success: !compileResult.error,
            value: JSON.stringify(compileResult),
          });
          break;
        }

        // whisper audio transcription
        case "transcribe": {
          console.log("prompt", data.blobDataUrl);

          const base64Data = data.blobDataUrl.split(",")[1];
          const prevTranscription = data.prevTranscription;
          const response = await fetch(`data:text/plain;base64,${base64Data}`);
          const blob: Blob = await response.blob();

          console.log("blob", blob);

          const whisperResponse = await whisper(blob, prevTranscription);
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
