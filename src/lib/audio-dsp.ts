export function getCodecForIdent(mimeTypeOrCodec: string) {
  switch (mimeTypeOrCodec) {
    case "opus":
    case 'audio/webm':
      return 'opus';
    case 'aac':
    case 'audio/m4a':
      return 'aac';
    case "mp3":
    case 'audio/mpeg':
      return 'mp3';
    case "wav":
    case "riff":
    case "pcm":
    case 'audio/wav':
      return 'wav';
    default:
      throw new Error('Unknown or unsupported audio codec');
  }
}

export function audioBufferToWav(audioBuffer: AudioBuffer) {
  return new Blob([audioBufferToWavArrayBuffer(audioBuffer)], {
    type: "audio/wav",
  });
}

export const blobToDataUrl = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export default function audioBufferToWavArrayBuffer(
  buffer: AudioBuffer,
  opt?: { float32?: boolean },
): ArrayBuffer {
  opt = opt || {};

  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = opt.float32 ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;

  let result: Float32Array;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }

  return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

function encodeWAV(
  samples: Float32Array,
  format: number,
  sampleRate: number,
  numChannels: number,
  bitDepth: number,
): ArrayBuffer {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  writeString(view, 0, "RIFF");
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  writeString(view, 8, "WAVE");
  writeString(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, "data");
  view.setUint32(40, samples.length * bytesPerSample, true);

  if (format === 1) {
    floatTo16BitPCM(view, 44, samples);
  } else {
    writeFloat32(view, 44, samples);
  }
  return buffer;
}

function interleave(inputL: Float32Array, inputR: Float32Array): Float32Array {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function writeFloat32(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function floatTo16BitPCM(
  output: DataView,
  offset: number,
  input: Float32Array,
) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export async function sliceAudioBufferAtPauses(
  originalBuffer: AudioBuffer,
  maxSecondsPerChunk = 30,
) {
  // First, detect pauses using the updated algorithm
  const pauses = detectPauses(originalBuffer);
  const sampleRate = originalBuffer.sampleRate;
  const chunks: Array<AudioBuffer> = [];
  let currentChunkStart = 0;
  let lastPauseBeforeMaxChunk = 0; // Keeps track of the last pause before reaching maxSecondsPerChunk

  // OfflineAudioContext for the original buffer's sample rate and channels
  const offlineContext = new OfflineAudioContext(
    originalBuffer.numberOfChannels,
    originalBuffer.length,
    originalBuffer.sampleRate,
  );

  for (let i = 0; i < pauses.length; i++) {
    const pause = pauses[i];
    // Calculate the end of the current chunk in samples
    const nextChunkStart = Math.floor(pause * sampleRate); // Ensuring integer index

    // Check if adding this pause would exceed maxSecondsPerChunk
    if (nextChunkStart - currentChunkStart > maxSecondsPerChunk * sampleRate) {
      // Use the lastPauseBeforeMaxChunk to split before exceeding maxSecondsPerChunk
      // Ensure we have a valid last pause, otherwise, use the current pause to avoid infinite loops
      const splitPoint =
        lastPauseBeforeMaxChunk > 0 ? lastPauseBeforeMaxChunk : nextChunkStart;
      const chunkLength = splitPoint - currentChunkStart;
      const chunkBuffer = offlineContext.createBuffer(
        originalBuffer.numberOfChannels,
        chunkLength,
        sampleRate,
      );

      // Copy the data for each channel
      for (
        let channel = 0;
        channel < originalBuffer.numberOfChannels;
        channel++
      ) {
        const originalData = originalBuffer.getChannelData(channel);
        const chunkData = chunkBuffer.getChannelData(channel);
        for (let i = 0; i < chunkLength; i++) {
          chunkData[i] = originalData[i + currentChunkStart];
        }
      }

      // Add the chunk to the list
      chunks.push(chunkBuffer);
      // Update the start for the next chunk
      currentChunkStart = splitPoint;
      // Reset lastPauseBeforeMaxChunk as we've just used it for splitting
      lastPauseBeforeMaxChunk = 0;
    } else {
      // Update lastPauseBeforeMaxChunk as this pause does not exceed maxSecondsPerChunk
      lastPauseBeforeMaxChunk = nextChunkStart;
    }
  }

  // Handle potential leftover audio as the last chunk
  if (currentChunkStart < originalBuffer.length) {
    const remainingLength = originalBuffer.length - currentChunkStart;
    const chunkBuffer = offlineContext.createBuffer(
      originalBuffer.numberOfChannels,
      remainingLength,
      sampleRate,
    );
    for (
      let channel = 0;
      channel < originalBuffer.numberOfChannels;
      channel++
    ) {
      const channelData = originalBuffer.getChannelData(channel);
      const chunkData = chunkBuffer.getChannelData(channel);
      for (let i = 0; i < remainingLength; i++) {
        chunkData[i] = channelData[currentChunkStart + i];
      }
    }
    chunks.push(chunkBuffer);
  }

  return chunks;
}

export interface AudioMetaData { 
  sampleRate: number, 
  numberOfChannels: number, 
  duration: number 
}

export async function getAudioMetadata(file: File): Promise<AudioMetaData> {

  // unpack file header - read a portion of the file (e.g., the first 1MB) to avoid loading the entire file
  const arrayBuffer = await file.slice(0, 1024 * 1024).arrayBuffer();

  // Create an AudioContext
  const audioContext = new AudioContext();

  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(
      arrayBuffer,
      (audioBuffer) => {
        const sampleRate = audioBuffer.sampleRate;
        const numberOfChannels = audioBuffer.numberOfChannels;
        const duration = audioBuffer.duration

        // Close the context to free up resources
        audioContext.close();

        resolve({ sampleRate, numberOfChannels, duration });
      },
      (error) => {
        reject(new Error('Unable to decode audio data.'));
      }
    );
  });
}


export async function getAudioFileAsAudioBuffer(
  file: File,
  audioContext: BaseAudioContext,
): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
}

export function detectPauses(audioBuffer: AudioBuffer): Array<number> {
  const channelData = audioBuffer.getChannelData(0); // Assuming mono audio
  const sampleRate = audioBuffer.sampleRate;
  const thresholdDb = -45; // dB threshold for silence
  const minSilenceDuration = 0.5; // seconds

  let isSilence = false;
  let silenceStartIndex = 0;
  let lowestVolumeMomentIndex = 0;
  let lowestVolumeSoFar = Number.POSITIVE_INFINITY;
  const pauses = [];

  for (let i = 0; i < channelData.length; i++) {
    const sample = channelData[i];
    const rms = Math.sqrt(sample * sample);
    const db = 20 * Math.log10(rms);

    if (db < thresholdDb) {
      if (!isSilence) {
        isSilence = true;
        silenceStartIndex = i;
        lowestVolumeSoFar = db;
        lowestVolumeMomentIndex = i;
      } else {
        if (db < lowestVolumeSoFar) {
          lowestVolumeSoFar = db;
          lowestVolumeMomentIndex = i;
        }
      }
    } else if (isSilence) {
      const silenceDuration = (i - silenceStartIndex) / sampleRate;
      if (silenceDuration >= minSilenceDuration) {
        const lowestVolumeMomentSeconds = lowestVolumeMomentIndex / sampleRate;
        pauses.push(lowestVolumeMomentSeconds);
      }
      isSilence = false;
      lowestVolumeSoFar = Number.POSITIVE_INFINITY;
    }
  }

  return pauses;
}

// https://www.researchgate.net/publication/370932659_Poperedne_obroblenna_audiodanih_dla_sistem_transkribuvanna_golosu
export function processAudioBufferWithBandpass(
  originalBuffer: AudioBuffer,
): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const offlineContext = new OfflineAudioContext(
      originalBuffer.numberOfChannels,
      originalBuffer.length,
      originalBuffer.sampleRate,
    );

    // Define the lower and upper cutoff frequencies based on the research findings
    const lowerFrequency = 150; // Set to the lower bound of the desired range
    const upperFrequency = 7000; // Set to the upper bound of the desired range

    // Calculate the center frequency and bandwidth
    const centerFrequency = (upperFrequency + lowerFrequency) / 2;
    const bandwidth = upperFrequency - lowerFrequency;

    // Configure the bandpass filter
    const bandpassFilter = offlineContext.createBiquadFilter();
    bandpassFilter.type = "bandpass";
    bandpassFilter.frequency.value = centerFrequency;
    bandpassFilter.Q.value = centerFrequency / bandwidth;

    // Configure the peaking filter to boost vocal frequencies
    const vocalBoostFilter = offlineContext.createBiquadFilter();
    vocalBoostFilter.type = "peaking";
    vocalBoostFilter.frequency.value = 1500; // Center frequency for vocal boost
    vocalBoostFilter.gain.value = 5; // Gain in dB
    vocalBoostFilter.Q.value = 1; // Quality factor

    const source = offlineContext.createBufferSource();
    source.buffer = originalBuffer;
    source.connect(bandpassFilter);
    bandpassFilter.connect(vocalBoostFilter);
    vocalBoostFilter.connect(offlineContext.destination);
    source.start();

    offlineContext
      .startRendering()
      .then((processedBuffer) => {
        resolve(processedBuffer);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

export const blobToArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert Blob to ArrayBuffer"));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export const blobToAudioBuffer = async (blob: Blob): Promise<AudioBuffer> => {
  const arrayBuffer = await blobToArrayBuffer(blob);
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(arrayBuffer);
};
