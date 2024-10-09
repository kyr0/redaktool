import type { TranscriptionTask } from "../../../shared";
import type { TranscriptionResponse } from "./interfaces";

export async function transcribeDeepgram(task: TranscriptionTask): Promise<TranscriptionResponse>  {
  const headers = {
    Accept: "application/json",
    Authorization: `Token ${task.apiKey}`,
    "Content-Type": `audio/${task.codec}`,
  };

  const options = {
    method: "POST",
    headers: headers,
    body: task.blob,
  };

  const query: any = {};
  
  if (typeof task.model !== "string") {
    query.model = "nova-2-general";
  } else {
    query.model = task.model;
  }

  if (typeof task.detect_language !== "boolean") {
    query.detect_language = 'true';
  }

  if (typeof task.punctuate !== "boolean") {
    query.punctuate = 'true';
  }

  if (task.diarize) {
    query.diarize = 'true';
  }

  const queryString = new URLSearchParams(query).toString();

  const response = await fetch(`https://api.deepgram.com/v1/listen?${queryString}`, options)
  
  if (!response.ok) {
    throw new Error(`Failed to make request: ${response.statusText}`);
  }
  const data = await response.json();

  console.log("Deepgram response", data);

  return {
    text: data.results.channels[0].alternatives[0].transcript,
  };
}