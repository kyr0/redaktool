import { OPEN_AI_API_KEY_NAME } from "../../../shared";
import { getPref } from "../prefs";

export async function whisper(
  audio: Blob,
  prevTranscription: string,
  format = "wav",
  transcribeEnglish = true,
) {
  const formData = new FormData();
  formData.append("file", audio, `audio.${format}`);
  formData.append("model", "whisper-1");
  formData.append("prompt", prevTranscription);

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
