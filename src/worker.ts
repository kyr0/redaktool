import("webextension-polyfill");

// https://github.com/dexaai/openai-fetch
import {
  OpenAIClient,
  type ChatParams,
  type ChatStreamResponse,
} from "openai-fetch";
import { OPEN_AI_API_KEY_NAME, PARTIAL_RESPONSE_TEXT_NAME } from "./shared";
import { getNamespacedKey } from "./lib/content-script/utils";
import { systemPromptStreaming } from "./lib/worker/llm/prompt";
import { compileSmartPrompt } from "./lib/worker/prompt";
import { dbGetValue, dbSetValue } from "./lib/worker/db";

// inject the activate.js script into the current tab
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id as number },
    files: ["dist/activate.js"],
  });
});

async function whisper(audio: Blob, format = "wav", transcribeEnglish = true) {
  const formData = new FormData();
  formData.append("file", audio, `audio.${format}`);
  formData.append("model", "whisper-1");

  const response = await fetch(
    `https://api.openai.com/v1/audio/${
      transcribeEnglish === true ? "transcriptions" : "translations"
    }`,
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${await getPref(OPEN_AI_API_KEY_NAME)}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}

// sync. storage must be used buffered because of MAX_WRITE_OPERATIONS_PER_MINUTE error

const getValue = async (key: string, defaultValue?: string, local = true) => {
  const result = await (local
    ? chrome.storage.local
    : chrome.storage.session
  ).get([key]);
  console.log(
    "getValue result",
    result,
    "for key",
    key,
    "default",
    defaultValue,
    "local",
    local,
  );
  return typeof result[key] === "undefined" ? defaultValue : result[key];
};

const setValue = async (key: string, value: any, local = true) => {
  console.log("setValue value", value, "for key", key, "local", local);
  await (local ? chrome.storage.local : chrome.storage.session).set({
    [key]: value,
  });
};

// TODO: setBlobValue, getBlobValue with unlimitedStorage permission; https://developer.chrome.com/docs/extensions/reference/api/storage?hl=de

const getPref = async (key: string, defaultValue?: string, local = true) => {
  return await getValue(getNamespacedKey(key), defaultValue);
};

const setPref = async (key: string, value: any, local = true) => {
  return await setValue(getNamespacedKey(key), value, local);
};
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

          console.log("prompt data", data);
          console.log("prompt", data.prompt);

          let partialResponseText = "";

          systemPromptStreaming(
            data.prompt,
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
            },
            (error: unknown) => {
              // TODO: respond with error return type

              // onError
              console.error("onError (internal)", error);
            },
            {
              model: "gpt-4o", // TODO: select dynamically, depending on provider and pass settings
              temperature: 0.7, // TODO: dynamically from settings
              n: 1,
            } as ChatParams,
            {
              apiKey: await getPref(OPEN_AI_API_KEY_NAME, "no-key"),
            },
          );

          /*
          async function readStreamChunks(
            stream: ReadableStream,
            cb: Function,
          ) {
            const reader = stream.getReader();

            console.log("reader", reader);
            // A function to handle reading each chunk
            async function read() {
              const { done, value } = await reader.read();
              if (done) {
                cb();
                return;
              }
              console.log("value", value);

              console.log("chunk", value.choices[0].delta.content);

              if (value.choices[0].delta.content) {
                partialResponseText += value.choices[0].delta.content;
              }
              setPref(PARTIAL_RESPONSE_TEXT_NAME, partialResponseText, false);
              read();
            }
            read();
          }

          const readableStream: ChatStreamResponse =
            await client.streamChatCompletion({
              model: "gpt-4o", // TODO: select dynamically, depending on provider and pass settings
              messages: [
                {
                  role: "system",
                  content: data.prompt,
                },
              ],
              temperature: 0.7, // TODO: dynamically from settings
              n: 1,
            } as ChatParams);

          // start reading the stream
          readStreamChunks(readableStream, () => {
            sendResponse({ result: JSON.stringify(partialResponseText) });
          });
          */

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

          const feed = await fetch(data.rssFeedUrl);
          const feedText = await feed.text();
          console.log("feedText", feedText);
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(feedText, "application/xml");

          const items = xmlDoc.querySelectorAll("item");
          const feedItems = Array.from(items).map((item) => {
            const title =
              item.querySelector("title")?.textContent ?? "No title";
            const link = item.querySelector("link")?.textContent ?? "No link";
            const pubDate =
              item.querySelector("pubDate")?.textContent ??
              "No publication date";
            return { title, link, pubDate };
          });

          console.log("feedItems", feedItems);
          sendResponse({ success: true, feed: JSON.stringify(feedItems) });
          break;
        }
      }
    }
  })();
  return true; // allow async response
});
