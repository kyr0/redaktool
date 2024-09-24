import { messageChannelApi } from "../../message-channel";
import type { TranscriptionTask } from "../../shared";

export async function transcribeInWorker(task: TranscriptionTask): Promise<{ text: string }> {
  return await messageChannelApi.sendCommand("transcribe", task)

  /*


  return new Promise((resolve, reject) => {
    (async () => {
      chrome.runtime.sendMessage(
        {
          action: "transcribe",
          text: JSON.stringify({
            blobDataUrl: await blobToDataUrl(blob),
            prevTranscription,
          }),
        },
        (response) => {
          console.log("transcribeInWorker response", response);
          if (response.success) {
            const value = JSON.parse(response.value);
            //console.log("got value", value);
            resolve(value);
          } else {
            reject("could not transcribe");
          }
        },
      );
    })();
  });
  */
}