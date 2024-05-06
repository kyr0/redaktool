import { useEffect } from "react";
import {
  isDarkModeEnabledInPrefs,
  setDarkModeEnabledInPrefs,
} from "../dark-mode";

export const applyDarkMode = (isDarkModeEnabled: boolean) => {
  if (isDarkModeEnabled) {
    document.documentElement.classList.add("ab-dark");
  } else {
    document.documentElement.classList.remove("ab-dark");
  }
};

export const useDarkMode = () => {
  useEffect(() => {
    (async () => {
      applyDarkMode(await isDarkModeEnabledInPrefs());
    })();
  }, []);

  return {
    get: async () => await isDarkModeEnabledInPrefs(),
    set: async (value: boolean) => {
      await setDarkModeEnabledInPrefs(value);
      applyDarkMode(value);
    },
  };
};
