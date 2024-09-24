/*
// Listen for messages from the extension
chrome.runtime.onMessage.addListener(msg => {
  console.log("audio processor recv msg", msg);
  if ('decode-filter-slice' in msg) decodeFilterSlice(msg['decode-filter-slice']);
});

// Play sound with access to DOM APIs
async function decodeFilterSlice({ buffer, metaData }) {
  console.log("decode filter slice", buffer, metaData);
  const audioContext = new AudioContext(metaData.numberOfChannels, metaData.sampleRate * metaData.duration, metaData.sampleRate);

  console.log("offline audio context", audioContext);

  const audioBuffer = await audioContext.decodeAudioData(buffer);

  console.log("audio buffer", audioBuffer);

  const source = audioContext.createBufferSource();

  const audio = new Audio(source);
  audio.volume = 0.0;
  audio.play(); // prevent Chrome from closing the processing thread
}
  */

/*
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'decode-filter-slice') {
    sendResponse(decodeFilterSlice(msg.payload));
  }
});

*/

let timeout;
navigator.serviceWorker.onmessage = e => {
  clearTimeout(timeout);
  console.log("audio processor recv msg", e);

  if (e.data instanceof File) {
    decodeFilterSlice(e.data).then(file => {
      console.log("file res", file);
      e.ports[0].postMessage(file);
      timeout = setTimeout(close, 60e3);
    });
  };
}

async function decodeFilterSlice(file) {
  console.log("decode filter slice", file);

  // prevent Chrome from disposing the offscreen audio context
  silentLoopedPlayback(file)

  const audioContext = new AudioContext();
  const buffer = await file.arrayBuffer();
  console.log("buffer", buffer);

  // AudioBuffer
  const filteredAudioBuffer = await processAudioBufferWithBandpass(
    await getAudioFileAsAudioBuffer(file, audioContext)
  );
  console.log("filteredAudioBuffer", filteredAudioBuffer);

  const filteredAudioBufferSlices = await sliceAudioBufferAtPauses(filteredAudioBuffer, 60)

  console.log("filteredAudioBufferSlices", filteredAudioBufferSlices);

  const wavBlobs = [];
  for (let i = 0; i < filteredAudioBufferSlices.length; i++) {
    console.log("Blobbing to wav", i);
    wavBlobs.push({
      blob: audioBufferToWav(filteredAudioBufferSlices[i]),
      duration: filteredAudioBufferSlices[i].duration,
    })
  }
  return wavBlobs;
}

function silentLoopedPlayback(file) {
    // Create an Object URL from the file
  const objectURL = URL.createObjectURL(file);

  // Create the Audio element and set the source
  const audio = new Audio(objectURL);

  // Set the audio to loop
  audio.loop = true;

  // Set the volume to 0 for absolute silence
  audio.volume = 0.001;

  // Start playback
  audio.play();
}

function audioBufferToMediaStream(audioBuffer) {
  // Create a regular AudioContext
  const audioContext = new AudioContext();
  
  // Create a buffer source and set the buffer
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  
  // Create a MediaStreamDestination
  const destination = audioContext.createMediaStreamDestination();
  
  // Connect the source to the destination
  source.connect(destination);
  
  // Return the MediaStream and the source node
  return { stream: destination.stream, source };
}

function transcodeToOpusBlob(stream, source) {
  return new Promise((resolve, reject) => {
    try {
      // Extract audio tracks from the captured MediaStream
      const audioTracks = stream.getAudioTracks();
      const audioStream = new MediaStream(audioTracks);

      // Set up the MediaRecorder with audioStream
      const recorder = new MediaRecorder(audioStream, {
        mimeType: "audio/webm; codecs=opus",
        audioBitsPerSecond: 128000,
      });

      const audioChunks = [];

      // When data is available (fired periodically based on recorder settings)
      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };

      // Handle the stop event to get the complete audio blob
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, {
          type: recorder.mimeType,
        });
        resolve(audioBlob);
      };

      // Start the audio buffer playback
      source.start();

      // Start the recording
      recorder.start(1000 /*ms*/);

      // Ensure the recorder stops when the buffer source finishes playing
      source.onended = () => {
        recorder.stop();
      };
    } catch (error) {
      reject(error);
    }
  });
}

function audioBufferToWav(audioBuffer) {
  return new Blob([audioBufferToWavArrayBuffer(audioBuffer)], {
    type: "audio/wav",
  });
}

const blobToDataUrl = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

function audioBufferToWavArrayBuffer(buffer, opt) {
  opt = opt || {};

  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = opt.float32 ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;

  let result;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }
  return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

function encodeWAV(samples, format, sampleRate, numChannels, bitDepth) {
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

function interleave(inputL, inputR) {
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

function writeFloat32(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

async function sliceAudioBufferAtPauses(originalBuffer, maxSecondsPerChunk = 30) {
  const pauses = detectPauses(originalBuffer);
  const sampleRate = originalBuffer.sampleRate;
  const chunks = [];
  let currentChunkStart = 0;
  let lastPauseBeforeMaxChunk = 0;

  const offlineContext = new OfflineAudioContext(
    originalBuffer.numberOfChannels,
    originalBuffer.length,
    originalBuffer.sampleRate
  );

  for (let i = 0; i < pauses.length; i++) {
    const pause = pauses[i];
    const nextChunkStart = Math.floor(pause * sampleRate);

    if (nextChunkStart - currentChunkStart > maxSecondsPerChunk * sampleRate) {
      const splitPoint = lastPauseBeforeMaxChunk > 0 ? lastPauseBeforeMaxChunk : nextChunkStart;
      const chunkLength = splitPoint - currentChunkStart;
      const chunkBuffer = offlineContext.createBuffer(
        originalBuffer.numberOfChannels,
        chunkLength,
        sampleRate
      );

      for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
        const originalData = originalBuffer.getChannelData(channel);
        const chunkData = chunkBuffer.getChannelData(channel);
        for (let i = 0; i < chunkLength; i++) {
          chunkData[i] = originalData[i + currentChunkStart];
        }
      }

      chunks.push(chunkBuffer);
      currentChunkStart = splitPoint;
      lastPauseBeforeMaxChunk = 0;
    } else {
      lastPauseBeforeMaxChunk = nextChunkStart;
    }
  }

  if (currentChunkStart < originalBuffer.length) {
    const remainingLength = originalBuffer.length - currentChunkStart;
    const chunkBuffer = offlineContext.createBuffer(
      originalBuffer.numberOfChannels,
      remainingLength,
      sampleRate
    );
    for (let channel = 0; channel < originalBuffer.numberOfChannels; channel++) {
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

async function getAudioMetadata(file) {
  const arrayBuffer = await file.slice(0, 1024 * 1024).arrayBuffer();
  const audioContext = new AudioContext();

  return new Promise((resolve, reject) => {
    audioContext.decodeAudioData(
      arrayBuffer,
      (audioBuffer) => {
        const sampleRate = audioBuffer.sampleRate;
        const numberOfChannels = audioBuffer.numberOfChannels;
        const duration = audioBuffer.duration;

        audioContext.close();
        resolve({ sampleRate, numberOfChannels, duration });
      },
      (error) => {
        reject(new Error("Unable to decode audio data."));
      }
    );
  });
}

async function getAudioFileAsAudioBuffer(file, audioContext) {
  const arrayBuffer = await file.arrayBuffer();
  return await audioContext.decodeAudioData(arrayBuffer);
}

function detectPauses(audioBuffer) {
  const channelData = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  const thresholdDb = -45;
  const minSilenceDuration = 0.5;

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
      } else if (db < lowestVolumeSoFar) {
        lowestVolumeSoFar = db;
        lowestVolumeMomentIndex = i;
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

function processAudioBufferWithBandpass(originalBuffer) {
  return new Promise((resolve, reject) => {
    const offlineContext = new OfflineAudioContext(
      originalBuffer.numberOfChannels,
      originalBuffer.length,
      originalBuffer.sampleRate
    );

    const bandpassFilter = offlineContext.createBiquadFilter();
    bandpassFilter.type = "bandpass";
    bandpassFilter.frequency.value = 590;
    bandpassFilter.Q.value = Math.sqrt(1100 / 80);

    const source = offlineContext.createBufferSource();
    source.buffer = originalBuffer;
    source.connect(bandpassFilter);
    bandpassFilter.connect(offlineContext.destination);
    source.start();

    offlineContext
      .startRendering()
      .then((processedBuffer) => resolve(processedBuffer))
      .catch((error) => reject(error));
  });
}

const blobToArrayBuffer = (blob) => {
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

const blobToAudioBuffer = async (blob) => {
  const arrayBuffer = await blobToArrayBuffer(blob);
  const audioContext = new AudioContext();
  return await audioContext.decodeAudioData(arrayBuffer);
};
