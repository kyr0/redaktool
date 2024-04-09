import { prefChrome } from "./prefs";
import { atomicSignal } from "./signal";

export const getDarkModeSetting = () => {
  return prefChrome<boolean>(
    "enable_dark_mode",
    window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
};

export const isDarkModeEnabledInPrefs = async () => {
  const storedIsDarkModeEnabled = getDarkModeSetting();
  console.log("getting dark mode", await storedIsDarkModeEnabled.get());

  return await storedIsDarkModeEnabled.get();
};

export const setDarkModeEnabledInPrefs = async (isDarkModeEnabled: boolean) => {
  const storedIsDarkModeEnabled = getDarkModeSetting();
  console.log("setting dark mode", isDarkModeEnabled);
  return await storedIsDarkModeEnabled.set(isDarkModeEnabled);
};
