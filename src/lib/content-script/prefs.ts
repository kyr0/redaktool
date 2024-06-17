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
  async function setValue(key: string, value: any, local = true) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "set", text: JSON.stringify({ key, value, local }) },
        (response) => {
          /*console.log("prefChrome:setValue:set response", response, "for", {
            action: "set",
            text: JSON.stringify({ key, value, local }),
          });*/
          if (response.success) {
            //console.log("value was set", key, value, response);
            resolve(key);
          } else {
            reject(`value was not set for key: ${key}`);
          }
        },
      );
    });
  }

  async function getValue(key: string, local = true) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "get", text: JSON.stringify({ key, local }) },
        (response) => {
          /*
          console.log("prefChrome:getValue:get response", response, "for", {
            action: "get",
            text: JSON.stringify({ key, local }),
          });
          */
          if (response.success) {
            try {
              const value = JSON.parse(response.value);
              //console.log("got value for", key, "value", value);
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
    get: async (local = true): Promise<T> => {
      const v = (await getValue(getNamespacedKey(key), local)) as T;
      return typeof v === "undefined"
        ? (Promise.resolve(defaultValue) as T)
        : v;
    },
    set: async (value: T, local = true) =>
      setValue(getNamespacedKey(key), value, local),
  };
};
