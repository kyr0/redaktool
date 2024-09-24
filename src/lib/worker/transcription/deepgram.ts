import type { TranscriptionTask } from "../../../shared";

export async function transcribeDeepgram(task: TranscriptionTask) {
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
  const response = await fetch("https://api.deepgram.com/v1/listen", options)
  
  if (!response.ok) {
    throw new Error(`Failed to make request: ${response.statusText}`);
  }
  const data = await response.json();
  return data;
}