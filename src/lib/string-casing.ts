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
