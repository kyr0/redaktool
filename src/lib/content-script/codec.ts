import { crc32 } from "./crypto";

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

/*

export async function isAudioEncoderAvailableAndSupportsOgg(): Promise<boolean> {
  try {
    // Check if AudioEncoder is defined in the global context
    if (typeof AudioEncoder === 'undefined') {
      return false;
    }

    // Check if the AudioEncoder supports the 'opus' codec for OGG
    const support = await AudioEncoder.isConfigSupported({
      codec: 'opus',
      sampleRate: 44000, // 44 kHz
      numberOfChannels: 2, // Stereo
    });

    console.log("AudioEncoder support check:", support);  

    return support.supported;
  } catch (error) {
    // If an error occurs, it means AudioEncoder is not available or doesn't support OGG
    console.error("AudioEncoder support check error:", error);
    return false;
  }
}

// Function to create an Opus Identification header
const createOpusIdentificationHeader = (channels: number, sampleRate: number, preSkip: number): Uint8Array => {
  const opusHeader = new Uint8Array(19);
  const magicSignature = 'OpusHead';

  // Write magic signature
  opusHeader.set(magicSignature.split('').map((char) => char.charCodeAt(0)), 0);

  // Version number
  opusHeader[8] = 1;

  // Channel count
  opusHeader[9] = channels;

  // Pre-skip (16-bit little-endian)
  opusHeader[10] = preSkip & 0xFF;
  opusHeader[11] = (preSkip >> 8) & 0xFF;

  // Input sample rate (informational only)
  opusHeader[12] = sampleRate & 0xFF;
  opusHeader[13] = (sampleRate >> 8) & 0xFF;
  opusHeader[14] = (sampleRate >> 16) & 0xFF;
  opusHeader[15] = (sampleRate >> 24) & 0xFF;

  // Output gain
  opusHeader[16] = 0;
  opusHeader[17] = 0;

  // Channel mapping family
  opusHeader[18] = 0;

  return opusHeader;
};

// Function to create an Opus Comment header
const createOpusCommentHeader = (vendorString = 'Encoded by MyApp', userComments = []): Uint8Array => {
  const magicSignature = 'OpusTags';
  const encoder = new TextEncoder();
  const magicSignatureBytes = encoder.encode(magicSignature);
  const vendorStringBytes = encoder.encode(vendorString);
  const vendorLengthBytes = new DataView(new ArrayBuffer(4));
  vendorLengthBytes.setUint32(0, vendorStringBytes.length, true);

  const userCommentListLengthBytes = new DataView(new ArrayBuffer(4));
  userCommentListLengthBytes.setUint32(0, userComments.length, true);

  const userCommentsBytesArray = [];
  for (const comment of userComments) {
    const commentBytes = encoder.encode(comment);
    const commentLengthBytes = new DataView(new ArrayBuffer(4));
    commentLengthBytes.setUint32(0, commentBytes.length, true);
    userCommentsBytesArray.push(new Uint8Array(commentLengthBytes.buffer));
    userCommentsBytesArray.push(commentBytes);
  }

  const commentHeader = new Uint8Array(
    magicSignatureBytes.length +
    4 +
    vendorStringBytes.length +
    4 +
    userCommentsBytesArray.reduce((acc, arr) => acc + arr.length, 0)
  );

  let offset = 0;
  commentHeader.set(magicSignatureBytes, offset);
  offset += magicSignatureBytes.length;
  commentHeader.set(new Uint8Array(vendorLengthBytes.buffer), offset);
  offset += 4;
  commentHeader.set(vendorStringBytes, offset);
  offset += vendorStringBytes.length;
  commentHeader.set(new Uint8Array(userCommentListLengthBytes.buffer), offset);
  offset += 4;
  for (const arr of userCommentsBytesArray) {
    commentHeader.set(arr, offset);
    offset += arr.length;
  }

  return commentHeader;
};

// Utility to split a 64-bit number into two 32-bit parts
const split64bitNumber = (n: number) => {
  const high = Math.floor(n / 2 ** 32);
  const low = n >>> 0;
  return { high, low };
};

// Function to create an Ogg page header
function createOggPageHeader(
  serialNumber: number,
  pageSequenceNumber: number,
  granulePosition: number | -1,
  segmentCount: number,
  headerType: number
): Uint8Array {
  const header = new Uint8Array(27 + segmentCount);
  const capturePattern = 'OggS';

  // Write capture pattern
  header.set(capturePattern.split('').map((char) => char.charCodeAt(0)), 0);

  // Version
  header[4] = 0;
  // Header type flag
  header[5] = headerType;

  // Set granule position
  if (granulePosition === -1) {
    // Set granule position to -1 (0xFFFFFFFFFFFFFFFF)
    header.set(new Uint8Array(8).fill(0xFF), 6);
  } else {
    const { high, low } = split64bitNumber(granulePosition);
    for (let i = 0; i < 4; i++) {
      header[6 + i] = (low >> (8 * i)) & 0xFF;
      header[10 + i] = (high >> (8 * i)) & 0xFF;
    }
  }

  // Write serial number
  for (let i = 0; i < 4; i++) {
    header[14 + i] = (serialNumber >> (8 * i)) & 0xFF;
  }

  // Write page sequence number
  for (let i = 0; i < 4; i++) {
    header[18 + i] = (pageSequenceNumber >> (8 * i)) & 0xFF;
  }

  // Placeholder for CRC checksum
  header.set([0, 0, 0, 0], 22);

  // Number of segments
  header[26] = segmentCount;

  return header;
}

// The main function to encode audio data to OGG Opus
export async function encodeToOgg(input: {
  blob: Blob;
  duration: number;
  bitrate: number;
}): Promise<Blob> {
  const pages: Uint8Array[] = [];
  let pageSequenceNumber = 0;
  let granulePosition = 0;
  const serialNumber = Math.floor(Math.random() * 0xFFFFFFFF);

  return new Promise<Blob>((resolve, reject) => {
    const transcodeResults: { data: Uint8Array; duration: number; timestamp: number }[] = [];

    const encoder = new AudioEncoder({
      output: (chunk: EncodedAudioChunk) => {
        const chunkData = new Uint8Array(chunk.byteLength);
        chunk.copyTo(chunkData);
        transcodeResults.push({
          data: chunkData,
          duration: chunk.duration!, // duration in microseconds
          timestamp: chunk.timestamp // timestamp in microseconds
        });
      },
      error: (error) => {
        console.error("AudioEncoder error:", error);
        reject(error);
      }
    });

    input.blob.arrayBuffer().then(async (audioBuffer) => {
      const audioContext = new AudioContext();
      const decodedData = await audioContext.decodeAudioData(audioBuffer);

      const numberOfChannels = decodedData.numberOfChannels;
      const sampleRate = decodedData.sampleRate;
      const length = decodedData.length;

      // Extract PCM data
      const pcmData = new Float32Array(length * numberOfChannels);
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const channelData = decodedData.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          pcmData[i * numberOfChannels + channel] = channelData[i];
        }
      }

      // Estimate pre-skip (encoder delay)
      const preSkip = 312; // Standard Opus pre-skip at 48 kHz

      // Configure the encoder with actual sample rate and channel count
      encoder.configure({
        codec: 'opus',
        sampleRate: sampleRate,
        numberOfChannels: numberOfChannels,
        bitrate: input.bitrate,
      });

      const frameSize = 960; // 20 ms at 48 kHz
      let timestamp = 0;

      // Break PCM data into frames and encode
      const totalFrames = Math.floor(length / frameSize);
      for (let i = 0; i < totalFrames; i++) {
        const frameData = pcmData.subarray(
          i * frameSize * numberOfChannels,
          (i + 1) * frameSize * numberOfChannels
        );
        const audioData = new AudioData({
          timestamp: timestamp,
          data: frameData,
          numberOfFrames: frameSize,
          numberOfChannels: numberOfChannels,
          sampleRate: sampleRate,
          format: 'f32',
        });
        encoder.encode(audioData);
        timestamp += (frameSize / sampleRate) * 1_000_000; // Convert to microseconds
      }

      // Handle any remaining samples
      const remainingSamples = length % frameSize;
      if (remainingSamples > 0) {
        const frameData = pcmData.subarray(
          totalFrames * frameSize * numberOfChannels
        );
        const audioData = new AudioData({
          timestamp: timestamp,
          data: frameData,
          numberOfFrames: remainingSamples,
          numberOfChannels: numberOfChannels,
          sampleRate: sampleRate,
          format: 'f32',
        });
        encoder.encode(audioData);
      }

      encoder.flush().then(async () => {
        console.log('Encoding completed');

        // Create identification header packet
        const idHeaderPacket = createOpusIdentificationHeader(numberOfChannels, sampleRate, preSkip);
        const idHeaderPacketLength = idHeaderPacket.length;
        const idHeaderSegmentCount = Math.ceil(idHeaderPacketLength / 255);

        // Create Ogg page header for identification header
        const idHeaderOggPageHeader = createOggPageHeader(
          serialNumber,
          pageSequenceNumber++,
          0,
          idHeaderSegmentCount,
          0x02 // Beginning of stream
        );

        // Create segment table for identification header
        const idHeaderSegmentTable = new Uint8Array(idHeaderSegmentCount);
        let remaining = idHeaderPacketLength;
        for (let i = 0; i < idHeaderSegmentCount; i++) {
          idHeaderSegmentTable[i] = Math.min(remaining, 255);
          remaining -= idHeaderSegmentTable[i];
        }

        // Assemble identification header page
        let offset = 0;
        const idHeaderPage = new Uint8Array(
          idHeaderOggPageHeader.length + idHeaderSegmentTable.length + idHeaderPacketLength
        );
        idHeaderPage.set(idHeaderOggPageHeader, offset);
        offset += idHeaderOggPageHeader.length;
        idHeaderPage.set(idHeaderSegmentTable, offset);
        offset += idHeaderSegmentTable.length;
        idHeaderPage.set(idHeaderPacket, offset);

        // Calculate CRC32 and set it in the page header
        let checksum = crc32(idHeaderPage);
        for (let i = 0; i < 4; i++) {
          idHeaderPage[22 + i] = (checksum >> (8 * i)) & 0xFF;
        }

        // Add to pages
        pages.push(idHeaderPage);

        // Create comment header packet
        const commentHeaderPacket = createOpusCommentHeader();
        const commentHeaderPacketLength = commentHeaderPacket.length;
        const commentHeaderSegmentCount = Math.ceil(commentHeaderPacketLength / 255);

        // Create Ogg page header for comment header
        const commentHeaderOggPageHeader = createOggPageHeader(
          serialNumber,
          pageSequenceNumber++,
          0,
          commentHeaderSegmentCount,
          0x00
        );

        // Create segment table for comment header
        const commentHeaderSegmentTable = new Uint8Array(commentHeaderSegmentCount);
        remaining = commentHeaderPacketLength;
        for (let i = 0; i < commentHeaderSegmentCount; i++) {
          commentHeaderSegmentTable[i] = Math.min(remaining, 255);
          remaining -= commentHeaderSegmentTable[i];
        }

        // Assemble comment header page
        offset = 0;
        const commentHeaderPage = new Uint8Array(
          commentHeaderOggPageHeader.length + commentHeaderSegmentTable.length + commentHeaderPacketLength
        );
        commentHeaderPage.set(commentHeaderOggPageHeader, offset);
        offset += commentHeaderOggPageHeader.length;
        commentHeaderPage.set(commentHeaderSegmentTable, offset);
        offset += commentHeaderSegmentTable.length;
        commentHeaderPage.set(commentHeaderPacket, offset);

        // Calculate CRC32 and set it in the page header
        checksum = crc32(commentHeaderPage);
        for (let i = 0; i < 4; i++) {
          commentHeaderPage[22 + i] = (checksum >> (8 * i)) & 0xFF;
        }

        // Add to pages
        pages.push(commentHeaderPage);

        // Now process the audio data chunks
        for (let i = 0; i < transcodeResults.length; i++) {
          const chunkInfo = transcodeResults[i];
          const chunk = chunkInfo.data;
          let chunkOffset = 0;
          let isContinuation = false;

          while (chunkOffset < chunk.length) {
            const remainingBytes = chunk.length - chunkOffset;
            const segmentSizes = [];
            let totalSegmentsSize = 0;

            // Build segment sizes for this page, up to a maximum of 255 segments per page
            while (segmentSizes.length < 255 && totalSegmentsSize < remainingBytes) {
              const segmentSize = Math.min(255, remainingBytes - totalSegmentsSize);
              segmentSizes.push(segmentSize);
              totalSegmentsSize += segmentSize;
            }

            const pageSegmentsCount = segmentSizes.length;
            const pageSegmentTable = new Uint8Array(segmentSizes);

            // Determine if the packet continues after this page
            const packetContinues = (chunkOffset + totalSegmentsSize) < chunk.length;
            // Determine if the packet completes on this page
            const packetCompletedOnPage = !packetContinues;

            // Set granule position
            let granulePositionToSet = -1;
            if (packetCompletedOnPage && !isContinuation) {
              // Update granule position based on samples decoded
              granulePosition += Math.round((chunkInfo.duration / 1_000_000) * sampleRate);
              granulePositionToSet = granulePosition - preSkip;
            }

            // Set header flags
            let headerType = 0x00;
            if (isContinuation) {
              headerType |= 0x01; // Continued packet
            }

            // Check if this is the last page
            const isLastChunk = i === transcodeResults.length - 1;
            const isLastPage = isLastChunk && packetCompletedOnPage;
            if (isLastPage) {
              headerType |= 0x04; // Set "end of stream" flag
            }

            // Create Ogg page header
            const oggPageHeader = createOggPageHeader(
              serialNumber,
              pageSequenceNumber++,
              granulePositionToSet,
              pageSegmentsCount,
              headerType
            );

            // Assemble the page
            const pageDataLength = oggPageHeader.length + pageSegmentTable.length + totalSegmentsSize;
            const page = new Uint8Array(pageDataLength);
            let pageOffset = 0;
            page.set(oggPageHeader, pageOffset);
            pageOffset += oggPageHeader.length;
            page.set(pageSegmentTable, pageOffset);
            pageOffset += pageSegmentTable.length;
            page.set(chunk.subarray(chunkOffset, chunkOffset + totalSegmentsSize), pageOffset);

            // Calculate CRC32
            const pageChecksum = crc32(page);
            for (let i = 0; i < 4; i++) {
              page[22 + i] = (pageChecksum >> (8 * i)) & 0xFF;
            }

            // Add page to pages array
            pages.push(page);

            // Update chunkOffset and isContinuation
            chunkOffset += totalSegmentsSize;
            isContinuation = packetContinues;
          }
        }

        // Concatenate all pages into the final buffer
        const finalBufferLength = pages.reduce((acc, page) => acc + page.length, 0);
        const finalBuffer = new Uint8Array(finalBufferLength);
        let finalOffset = 0;
        for (const page of pages) {
          finalBuffer.set(page, finalOffset);
          finalOffset += page.length;
        }

        // Create the final Blob as an OGG file with OPUS codec
        const encodedBlob = new Blob([finalBuffer], { type: 'audio/ogg; codecs=opus' });
        resolve(encodedBlob);

      }).catch(reject);
    }).catch(reject);
  });
}*/