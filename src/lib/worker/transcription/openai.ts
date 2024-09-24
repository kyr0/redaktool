import type { TranscriptionTask } from "../../../shared";

export async function transcribeOpenai(task: TranscriptionTask) {
  const formData = new FormData();
  formData.append("file", task.blob, `audio.${task.codec || "wav"}`);
  formData.append("model", task.model || "whisper-1");

  if (task.prompt) {
    formData.append("prompt", task.prompt);
  }

  const response = await fetch(
    "https://api.openai.com/v1/audio/transcriptions",
    {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${task.apiKey}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
}
