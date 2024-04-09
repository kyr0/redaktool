import { getStorage } from "simply-persist-sync";
import { getNamespacedKey } from "./utils";

export const prefPerPage = <T>(key: string, defaultValue?: T) => {
  const storage = getStorage("local");
  return {
    get: (): T => storage.get(getNamespacedKey(key), defaultValue) as T,
    set: (value: T) => storage.set(getNamespacedKey(key), value),
  };
};

// async chrome extension storage-synced prefs, connected to worker
export const prefChrome = <T>(key: string, defaultValue?: T) => {
  async function setValue(key: string, value: any) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "set", text: JSON.stringify({ key, value }) },
        (response) => {
          if (response.success) {
            console.log("value was set", key, value, response);
            resolve(key);
          } else {
            reject(`value was not set for key: ${key}`);
          }
        },
      );
    });
  }

  async function getValue(key: string) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "get", text: JSON.stringify({ key }) },
        (response) => {
          if (response.success) {
            try {
              const value = JSON.parse(response.value);
              console.log("got value for", key, "value", value);
              resolve(value);
            } catch (error) {
              resolve(defaultValue);
            }
          } else {
            reject(`could not get value for key: ${key}`);
          }
        },
      );
    });
  }
  return {
    get: async (): Promise<T> =>
      typeof (getValue(getNamespacedKey(key)) as T) === "undefined"
        ? (Promise.resolve(defaultValue) as T)
        : (getValue(getNamespacedKey(key)) as T),
    set: async (value: T) => setValue(getNamespacedKey(key), value),
  };
};
