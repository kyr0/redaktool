import { useEffect } from "react";

export const useKeystroke = (key: string, onActivated: Function) => {
  // run activation function Control + ${key} or Alt + ${key} is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === key.toLowerCase() && (e.ctrlKey || e.altKey)) {
        e.preventDefault();
        onActivated();
      }
    };
    document.addEventListener("keydown", down, false);
    return () => document.removeEventListener("keydown", down, false);
  }, []);
};
