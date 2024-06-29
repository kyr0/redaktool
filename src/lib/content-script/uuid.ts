const HEX: Array<string> = Array.from({ length: 256 }, (_, idx) =>
  (idx + 256).toString(16).substring(1),
);
let BUFFER: Uint8Array | undefined;
let BUFFER_INDEX = 0;

export function uuid(): string {
  if (!BUFFER || BUFFER_INDEX + 16 > 256) {
    BUFFER = new Uint8Array(256);
    crypto.getRandomValues(BUFFER); // use crypto to fill the buffer with random values
    BUFFER_INDEX = 0;
  }

  let i = 0;
  let out = "";
  const startIndex = BUFFER_INDEX;

  for (; i < 16; i++) {
    const num = BUFFER[startIndex + i];
    if (i === 6) {
      out += HEX[(num & 15) | 64]; // set the version to 4
    } else if (i === 8) {
      out += HEX[(num & 63) | 128]; // set the variant to RFC 4122
    } else {
      out += HEX[num];
    }

    // add hyphens at appropriate positions
    if (i & 1 && i > 1 && i < 11) {
      out += "-";
    }
  }

  BUFFER_INDEX += 16; // increment BUFFER_INDEX by 16 for the next call
  return out;
}
