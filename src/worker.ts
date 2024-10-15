// DEPRECATED
//import("webextension-polyfill");
declare const self: ServiceWorkerGlobalScope;

import {
  ANTHROPIC_API_KEY_NAME,
  OPEN_AI_API_KEY_NAME,
  type MLModel,
  type MessageChannelPackage,
  type MessageChannelMessage,
  type DbKeyValue,
  type AudioTranscriptionData,
  type TranscriptionTask,
  type SlicedAudioWavs,
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
import { transcribeOpenai } from "./lib/worker/transcription/openai";
import type {
  CompilePrompt,
  Prompt,
  PromptPartialResponse,
} from "./lib/content-script/prompt-template";
import { getWellKnownAIModel } from "./lib/content-script/ai-models";
/*
import {
  calculateEffectivePrice,
  getPriceModel,
} from "./lib/content-script/pricemodels";
 */
import { useMessageChannel } from "./lib/worker/message-channel";
import { loadEmbeddingModel } from "./lib/worker/embedding/model";
import { getAudioFileAsAudioBuffer, type AudioMetaData } from "./lib/audio-dsp";
import { transcribeDeepgram } from "./lib/worker/transcription/deepgram";

// establish fast, MessageChannel-based communication between content script and worker
const { postMessage, addListener } = useMessageChannel<MessageChannelMessage>();

/*


async function decodeAudioUsingWebCodecs(file: File, codec: string, metaData: AudioMetaData) {
  // Step 1: Read the file data as an ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();

  // Step 2: Initialize the AudioDecoder
  const audioDecoder = new AudioDecoder({
    output: handleDecodedFrame,
    error: (error) => console.error("AudioDecoder error:", error),
  });

  // Step 3: Configure the AudioDecoder with the correct codec
  audioDecoder.configure({
    codec, 
    sampleRate: metaData.sampleRate,
    numberOfChannels: metaData.numberOfChannels,
  });

  // Helper function to convert ArrayBuffer to EncodedAudioChunk
  function createEncodedAudioChunk(arrayBuffer: ArrayBuffer) {
    return new EncodedAudioChunk({
      type: 'key',
      timestamp: 0, // Adjust if you have timing data
      data: new Uint8Array(arrayBuffer),
    });
  }

  // Step 4: Feed the encoded data to the AudioDecoder
  const encodedChunk = createEncodedAudioChunk(arrayBuffer);
  audioDecoder.decode(encodedChunk);

  // Initialize variables for accumulating frames
  const decodedFrames: Float32Array[][] = [];
  let totalFrames = 0;
  let sampleRate = 0;
  let numberOfChannels = 0;

  // Step 5: Handle the output PCM data and integrate with OfflineAudioContext
  async function handleDecodedFrame(frame: AudioData) {
    // Set the sampleRate and numberOfChannels on the first frame
    if (totalFrames === 0) {
      sampleRate = frame.sampleRate;
      numberOfChannels = frame.numberOfChannels;
    }

    // Keep track of the total number of frames
    totalFrames += frame.numberOfFrames;

    // Copy the PCM data from the frame
    const frameData: Float32Array[] = [];
    for (let channel = 0; channel < frame.numberOfChannels; channel++) {
      const channelData = new Float32Array(frame.numberOfFrames);
      frame.copyTo(channelData, { planeIndex: channel });
      frameData.push(channelData);
    }

    // Store the frame data
    decodedFrames.push(frameData);

    // Close the frame after processing to free up memory
    frame.close();
  }

  // When decoding finishes, this function will be called
  async function finalizeDecoding() {
    // Create an OfflineAudioContext with the accumulated data
    const offlineContext = new OfflineAudioContext(
      numberOfChannels,
      totalFrames,
      sampleRate
    );

    // Create an AudioBuffer to store the complete decoded data
    const audioBuffer = offlineContext.createBuffer(
      numberOfChannels,
      totalFrames,
      sampleRate
    );

    // Copy accumulated frame data into the AudioBuffer
    let offset = 0;
    for (const frameData of decodedFrames) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        audioBuffer.copyToChannel(frameData[channel], channel, offset);
      }
      offset += frameData[0].length;
    }

    console.log("Final Decoded AudioBuffer:", audioBuffer);
    return audioBuffer; // Return or process further
  }

  // Monitor the state of the decoder and finalize when it's done
  await audioDecoder.flush()
  audioDecoder.close();

  return finalizeDecoding();
}

  */

let offscreenClient: Client | null = null;

// Create the offscreen document if it doesn't already exist
async function initializeOffscreenClient() {
  console.log("initializeOffscreenClient");
  const url = chrome.runtime.getURL('audio-processor.html');

  // Send a "ping" to the offscreenClient and check for "pong" response
  if (offscreenClient) {

    await new Promise<void>((resolve) => {

      const messageChannel = new MessageChannel();
      const pingTimeout = setTimeout(async () => {
        console.log("Ping not answered, re-initializing offscreen client");
        offscreenClient = null;
        resolve();
      }, 10);

      messageChannel.port1.onmessage = (event) => {
        if (event.data === "pong") {
          clearTimeout(pingTimeout);
          console.log("Received pong from offscreen client");
          resolve();
        }
      };

      if (offscreenClient) {
        offscreenClient.postMessage("ping", [messageChannel.port2]);
      }
    })    
  }

  if (!offscreenClient) {
    console.log("create offscreen client as it doesn't exist", url);
    await chrome.offscreen.createDocument({
      url,
      reasons: ["AUDIO_PLAYBACK"] as Array<chrome.offscreen.Reason>,
      justification: 'Transcoding and slicing transcription audio.' // details for using the API
    });

    offscreenClient = (await self.clients.matchAll({ includeUncontrolled: true }))
      .find(c => c.url === url) || null;

    console.log("client", offscreenClient);
  }
}

async function postMessageToOffscreen(data: any): Promise<any> {
  try {
    await initializeOffscreenClient();
  } catch(e) {
    console.warn("Warning: Initializing offscreen client failed", e);
  }

  return new Promise((resolve, reject) => {
    if (offscreenClient) {
      // Create a new MessageChannel for each communication
      const messageChannel = new MessageChannel();

      // Listen for the response from the offscreen client
      messageChannel.port1.onmessage = (event) => {
        if (event.data) {
          resolve(event.data);
        } else {
          reject(new Error("No data received from offscreen client"));
        }
      };

      // Send the message with the new MessagePort
      try {
        offscreenClient.postMessage(data, [messageChannel.port2]);
      } catch (error) {
        reject(new Error(`Failed to post message to offscreen client: ${error}`));
      }
    } else {
      reject(new Error("Offscreen client not initialized"));
    }
  });
}


async function decodeSliceOffscreen(audioFile: File, waitingSpeechBlob: Blob) {
  try {
    console.log("decodeSliceOffscreen", audioFile);
    const res = await postMessageToOffscreen({ audioFile, waitingSpeechBlob });
    console.log("res data", res);
    return res;
  } catch (error) {
    console.error("Error decoding slice offscreen", error);
  }
}

// instant memory/heap reference pub/sub messaging
addListener(async(e) => {
  console.log("worker message", e.data);
  switch (e.data.action) {
    case "model": {
      const model = e.data.payload as MLModel;
      loadEmbeddingModel(model);
      break;
    }

    case "transcribe": {

      try {

        const transcriptionTask = e.data.payload as TranscriptionTask;
        console.log("transcribe", transcriptionTask);
        let transcriptionResponse;
        switch (transcriptionTask.providerType) {
          case "openai": {
            transcriptionResponse = await transcribeOpenai(transcriptionTask);
            break;
          }
          case "deepgram": {
            transcriptionResponse = await transcribeDeepgram(transcriptionTask);
            break;
          }
        }
        console.log("transcriptionResponse", transcriptionResponse);

        postMessage({
          id: e.data.id,
          success: true,
          action: "transcribe-result",
          payload: transcriptionResponse 
        })

      } catch (error) {
        console.log("transcribe error", e.data.payload, error);
        postMessage({
          id: e.data.id,
          success: false,
          error,
          action: "transcribe-result",
          payload: null
        })
      }
      break;
    }

    case "process-transcription-audio": {

      try {
        // audio.audioFile is of type File
        const audioTranscriptionData = e.data.payload as AudioTranscriptionData;

        console.log("audio recv", audioTranscriptionData);
        //const codec = getCodecFromMimeType(audio.audioFile.type);
        //const metaData = audio.metaData;
        //const fileBlob = new Blob([audio.audioFile], { type: audio.audioFile.type });
        //const arrayBuffer = await audio.audioFile.arrayBuffer();
        //console.log("arrayBuffer", arrayBuffer);

        const wavBlobs: SlicedAudioWavs = await decodeSliceOffscreen(audioTranscriptionData.audioFile, audioTranscriptionData.waitingSpeechAudioBlob);

        // trancode to ogg theora
        console.log("wavBlobs", wavBlobs);

        postMessage({
          id: e.data.id,
          success: true,
          action: "process-transcription-audio-result",
          payload: wavBlobs 
        })
      } catch (error) {
        console.log("process transcription audio error", e.data.payload, error);
        postMessage({
          id: e.data.id,
          success: false,
          error,
          action: "process-transcription-audio",
          payload: null
        })
      }

      /*
      // create an AudioContext to decode the audio file and get its duration
      const audioBuffer = await decodeAudioUsingWebCodecs(audio.audioFile, codec, audio.metaData);
      const duration = audioBuffer.duration;
      */

      // create an OfflineAudioContext with the correct length based on the audio file duration
      
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
        /*
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
                totalPrice: 0,
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
        */

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
        /*
        case "transcribe": {
          console.log("prompt", data.blobDataUrl);

          const base64Data = data.blobDataUrl.split(",")[1];
          const prevTranscription = data.prevTranscription;
          const response = await fetch(`data:text/plain;base64,${base64Data}`);
          const blob: Blob = await response.blob();

          console.log("blob", blob);

          const whisperResponse = await transcribeOpenai(blob, prevTranscription);
          sendResponse({
            success: true,
            value: JSON.stringify(whisperResponse),
          });
          break;
        }
        */

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
