import { getNamespacedKey } from "../content-script/utils";

// sync. storage must be used buffered because of MAX_WRITE_OPERATIONS_PER_MINUTE error

export const getValue = async (
  key: string,
  defaultValue?: string,
  local = true,
) => {
  const result = await (local
    ? chrome.storage.local
    : chrome.storage.session
  ).get([key]);
  console.log(
    "getValue result",
    result,
    "for key",
    key,
    "default",
    defaultValue,
    "local",
    local,
  );
  return typeof result[key] === "undefined" ? defaultValue : result[key];
};

export const setValue = async (key: string, value: any, local = true) => {
  console.log("setValue value", value, "for key", key, "local", local);
  await (local ? chrome.storage.local : chrome.storage.session).set({
    [key]: value,
  });
};

// TODO: setBlobValue, getBlobValue with unlimitedStorage permission; https://developer.chrome.com/docs/extensions/reference/api/storage?hl=de

export const getPref = async (
  key: string,
  defaultValue?: string,
  local = true,
) => {
  return await getValue(getNamespacedKey(key), defaultValue);
};

export const setPref = async (key: string, value: any, local = true) => {
  return await setValue(getNamespacedKey(key), value, local);
};
