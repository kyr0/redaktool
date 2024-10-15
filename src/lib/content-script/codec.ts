
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
