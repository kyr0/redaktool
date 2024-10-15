
type CodecInfo = {
  mimeType: string;
  fileExtensions: Array<string>;
};

const VIDEO_CODECS: Array<CodecInfo> = [
  { mimeType: 'video/mp4; codecs="mp4v.20.8"', fileExtensions: ['mp4'] },
  { mimeType: 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"', fileExtensions: ['mp4'] },
  { mimeType: 'video/ogg; codecs="theora"', fileExtensions: ['ogg'] },
  { mimeType: 'video/webm; codecs="vp8, vorbis"', fileExtensions: ['webm'] },
];

const AUDIO_CODECS: Array<CodecInfo> = [
  { mimeType: 'audio/mpeg', fileExtensions: ['mp3'] },
  { mimeType: 'audio/mp4; codecs="mp4a.40.2"', fileExtensions: ['aac'] },
  { mimeType: 'audio/ogg; codecs="vorbis"', fileExtensions: ['ogg'] },
  { mimeType: 'audio/ogg; codecs="opus"', fileExtensions: ['opus'] },
  { mimeType: 'audio/webm; codecs="vorbis"', fileExtensions: ['webm'] },
  { mimeType: 'audio/wav; codecs="1"', fileExtensions: ['wav', 'wave'] },
];

let cachedSupportedCodecs: Array<CodecInfo> | null = null;

export function getSupportedCodecs(): Array<CodecInfo> {
  if (!cachedSupportedCodecs) {
    cachedSupportedCodecs = detectAllSupportedCodecs();
  }
  return cachedSupportedCodecs;
}

function detectAllSupportedCodecs(): Array<CodecInfo> {
  const videoSupport = detectSupport(VIDEO_CODECS, 'video');
  const audioSupport = detectSupport(AUDIO_CODECS, 'audio');
  return [...videoSupport, ...audioSupport];
}

function detectSupport(codecs: Array<CodecInfo>, elementType: 'video' | 'audio'): Array<CodecInfo> {
  const element = document.createElement(elementType);
  return codecs.filter(codec => element.canPlayType(codec.mimeType) !== '');
}

export async function isAudioEncoderAvailableAndSupportsOgg(): Promise<boolean> {
  try {
    // Check if AudioEncoder is defined in the global context
    if (typeof AudioEncoder === 'undefined') {
      return false;
    }

    // Check if the AudioEncoder supports the 'opus' codec for OGG
    const support = await AudioEncoder.isConfigSupported({
      codec: 'opus',
      sampleRate: 48000, // Common sample rate for Opus
      numberOfChannels: 2 // Stereo
    });

    return support.supported;
  } catch (error) {
    // If an error occurs, it means AudioEncoder is not available or doesn't support OGG
    console.error("AudioEncoder support check error:", error);
    return false;
  }
}

export async function encodeToOgg(input: {
  blob: Blob;
  duration: number;
  numberOfChannels: number;
  sampleRate: number;
}): Promise<Blob> {
  const transcodeResults: Uint8Array[] = [];

  return new Promise<Blob>((resolve, reject) => {
    const encoder = new AudioEncoder({
      output: (chunk: EncodedAudioChunk) => {
        //console.log("Encoded chunk:", chunk);

        // Create a Uint8Array to store the encoded chunk's data
        const chunkData = new Uint8Array(chunk.byteLength);
        chunk.copyTo(chunkData);
        transcodeResults.push(chunkData);  // Push the chunk data
      },
      error: (error) => {
        console.error("AudioEncoder error:", error);
        reject(error);
      }
    });

    // Configure the encoder with the provided parameters
    encoder.configure({
      codec: 'opus',  // Opus codec for OGG
      sampleRate: input.sampleRate,  // Use provided sample rate
      numberOfChannels: input.numberOfChannels,  // Use provided number of channels
      bitrate: 24000,  // 24 kbps is efficient for speech transcription
    });

    // Convert the input blob to ArrayBuffer and feed it to the encoder
    input.blob.arrayBuffer().then(audioBuffer => {
      const float32Data = new Float32Array(audioBuffer);

      // Calculate the number of frames based on the size of the buffer
      const numberOfFrames = float32Data.length / input.numberOfChannels;
      // Encode the PCM data as AudioData
      const audioData = new AudioData({
        numberOfFrames,
        numberOfChannels: input.numberOfChannels,
        sampleRate: input.sampleRate,
        format: 'f32',  // PCM format in Chrome, Edge, etc. is 32-bit float
        timestamp: performance.now(),
        data: float32Data
      });

      encoder.encode(audioData);  // Encode the audio data

      encoder.flush().then(() => {
        console.log('Encoding completed');

        // Concatenate all Uint8Array chunks into a single Uint8Array
        const totalLength = transcodeResults.reduce((acc, chunk) => acc + chunk.length, 0);
        const finalBuffer = new Uint8Array(totalLength);

        let offset = 0;
        for (const chunk of transcodeResults) {
          finalBuffer.set(chunk, offset);
          offset += chunk.length;
        }

        // Create the final Blob as an OGG file
        const encodedBlob = new Blob([finalBuffer], { type: 'audio/ogg' });
        resolve(encodedBlob);  // Resolve with the final Blob
      }).catch(reject);
    }).catch(reject);
  });
}
