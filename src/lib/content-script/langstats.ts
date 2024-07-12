import avgCharsPerWord from "../../data/langstats/average-chars-per-word.json";

export interface AvgCharsPerWordMapping {
  [iso2Code: string]: number;
}

const AvgCharsPerWordMapping: AvgCharsPerWordMapping = avgCharsPerWord;

// as of current data: 9.16; precomputed
const AvgCharsPerWordOverall =
  Object.keys(AvgCharsPerWordMapping).reduce(
    (acc, key) => acc + AvgCharsPerWordMapping[key],
    0,
  ) / Object.keys(AvgCharsPerWordMapping).length;

export const estimateWordsForCharCount = (
  charsWithSpacesAndInterpunctation: number,
  iso2LanguageCode: string,
): number => {
  const avgCharsPerWord =
    AvgCharsPerWordMapping[iso2LanguageCode.toUpperCase()];

  if (typeof avgCharsPerWord === "number") {
    return Math.ceil(charsWithSpacesAndInterpunctation / avgCharsPerWord);
  }

  // fallback to overall average if language is unknown
  return Math.ceil(charsWithSpacesAndInterpunctation / AvgCharsPerWordOverall);
};

export const calculateWordsForText = (text: string) =>
  text
    .trim()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean).length;
