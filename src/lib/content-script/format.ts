export function formatCurrencyForDisplay(number: number) {
  // Convert number to string
  const numberStr = number.toString();
  // Find index of first non-zero digit after decimal point
  let nonZeroIndex = numberStr.indexOf(".") + 1; // Start looking right after the decimal point
  while (numberStr[nonZeroIndex] === "0") {
    nonZeroIndex++;
  }

  // Find the index to cut off the string
  // Start looking from the first non-zero digit after decimal
  let cutIndex = nonZeroIndex + 1;
  while (cutIndex < numberStr.length && numberStr[cutIndex] === "0") {
    // Move to the next digit if it's zero
    cutIndex++;
  }

  // If we have encountered a non-zero digit, trim everything after it
  if (numberStr[cutIndex] >= "1" && numberStr[cutIndex] <= "9") {
    // Keep everything until a zero after a number from 1-9
    while (cutIndex < numberStr.length && numberStr[cutIndex] !== "0") {
      cutIndex++;
    }
  } else {
    // If no non-zero digits were found, keep everything
    cutIndex = numberStr.length;
  }

  // Return the formatted number string
  return numberStr.substring(0, cutIndex);
}

export const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = Math.floor(duration % 60);

  // Padding numbers to ensure they're displayed as two digits
  const paddedHours = hours.toString().padStart(2, "0");
  const paddedMinutes = minutes.toString().padStart(2, "0");
  const paddedSeconds = seconds.toString().padStart(2, "0");

  // Adjusting format based on the duration (e.g., omitting hours if not present)
  return `${
    hours > 0 ? `${paddedHours}:` : ""
  }${paddedMinutes}:${paddedSeconds}`;
};
