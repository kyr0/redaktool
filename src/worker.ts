import("webextension-polyfill")

// https://github.com/dexaai/openai-fetch
import { OpenAIClient, type ChatParams, type ChatStreamResponse } from 'openai-fetch';

// inject the activate.js script into the current tab
chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
        target: {tabId: tab.id as number},
        files: ['dist/activate.js']
    });
});

async function whisper(audio: Blob, format: string = "wav", transcribeEnglish: boolean = true) {
    const formData = new FormData();
    formData.append('file', audio, `audio.${format}`);
    formData.append('model', 'whisper-1');

    const response = await fetch(`https://api.openai.com/v1/audio/${transcribeEnglish === true ? 'transcriptions' : 'translations'}`, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${await getValue('OPEN_AI_API_KEY', "no-key")}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
}


const getValue = async (key: string, defaultValue?: string) => {
    const result = await chrome.storage.local.get([key]);
    return result[key] || defaultValue;
}

const setValue = async (key: string, value: any) => {
    await chrome.storage.local.set({ [key]: value });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

    console.log('Received message:', request);

    (async() => {

        console.log('worker script loaded', await getValue('openAiApiKey'))
        const client = new OpenAIClient({ apiKey: await getValue('OPEN_AI_API_KEY', "no-key") });
            
        // Process the message
        if (request.action && request.text) {
            
            const data = JSON.parse(request.text)

            // Example processing: log action and text
            console.log('Action:', request.action);
            console.log('Data:', JSON.stringify(data));
           
            switch (request.action) {
                case "get":
                    try {
                        const value = await getValue(data.key);
                    
                        sendResponse({success: true, value: JSON.stringify(value)});
                    } catch (error) {   
                        sendResponse({success: false, value: undefined });
                    }
                    break;
                case "set":
                    await setValue(data.key, data.value);
                    sendResponse({success: true});
                    break;
                case "prompt":
                    console.log('prompt', data.prompt)

                    let partialResponseText = ''

                    async function readStreamChunks(stream: ReadableStream, cb: Function) {
                        const reader = stream.getReader();
                      
                        // A function to handle reading each chunk
                        async function read() {
                          const { done, value } = await reader.read();
                          if (done) {
                            cb();
                            return;
                          }

                          partialResponseText += value.choices[0].delta.content
                          setValue('partialResponseText', partialResponseText)
                          read();
                        }
                        read();
                      }
                      
                    const readableStream: ChatStreamResponse = await client.streamChatCompletion({
                        model: "gpt-4-turbo-preview",
                        messages: [
                            {
                                role: "system",
                                content: data.prompt
                            },
                        ],
                        temperature: 0.7,
                        n: 1,
                    } as ChatParams);

                    // start reading the stream
                    readStreamChunks(readableStream, () => {
                        sendResponse({result: JSON.stringify(partialResponseText)});
                    })

                    break;

                case "transcribe":

                    console.log('prompt', data.blobDataUrl)

                    const base64Data = data.blobDataUrl.split(',')[1];
                    const response = await fetch(`data:text/plain;base64,${base64Data}`);
                    const blob: Blob = await response.blob();

                    console.log('blob', blob)

                    const whisperResponse = await whisper(blob)
                    sendResponse({success: true, value: JSON.stringify(whisperResponse)});
                    break;

                case "rss":

                    console.log('rssFeedUrl', data.rssFeedUrl)
                                        
                    const feed = await fetch(data.rssFeedUrl);
                    const feedText = await feed.text();
                    console.log('feedText', feedText)
                    const parser = new DOMParser();
                    const xmlDoc = parser.parseFromString(feedText, "application/xml");
                  
                    const items = xmlDoc.querySelectorAll("item");
                    const feedItems = Array.from(items).map((item) => {
                      const title = item.querySelector("title")?.textContent ?? "No title";
                      const link = item.querySelector("link")?.textContent ?? "No link";
                      const pubDate = item.querySelector("pubDate")?.textContent ?? "No publication date";
                      return { title, link, pubDate };
                    });
                  
                    console.log('feedItems', feedItems)
                    sendResponse({success: true, feed: JSON.stringify(feedItems)});
                    break;

            }
        }
    })()
    return true; // allow async response
});