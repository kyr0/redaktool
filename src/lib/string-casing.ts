export const toSnakeCase = (str: string) =>
  str
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");

export const toUpperCamelCase = (str: string) =>
  str
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");

export const isUpperCamelCase = (str: string) =>
  /^[A-Z][a-z]*([A-Z][a-z]*)*$/.test(str);

export const upperCaseFirst = (text: string) =>
  typeof text !== "string"
    ? text
    : text.charAt(0).toUpperCase() + text.slice(1);
