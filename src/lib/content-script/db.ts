// async chrome extension storage-synced db key values, connected to worker
export const db = <T>(key: string, defaultValue?: T) => {
  async function setValue(key: string, value: any) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage(
        { action: "db-set", text: JSON.stringify({ key, value }) },
        (response) => {
          if (response.success) {
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
        { action: "db-get", text: JSON.stringify({ key }) },
        (response) => {
          if (response.success) {
            try {
              const value = JSON.parse(response.value);
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
    get: async (): Promise<T> => {
      const v = (await getValue(key)) as T;
      return typeof v === "undefined"
        ? (Promise.resolve(defaultValue) as T)
        : v;
    },
    set: async (value: T) => setValue(key, value),
  };
};
