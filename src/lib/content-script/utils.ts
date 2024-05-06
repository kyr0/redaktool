import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const pxToPct = (px: number, base: number) => (px / base) * 100;

export const pctToPx = (pct: number, base: number) => (pct / 100) * base;

export const getNamespacedKey = (key: string) => `__languagemagic_${key}`;

export const safeDisplayPosition = (position: { x: number; y: number }) => {
  let { x, y } = position;
  if (x > window.innerWidth) {
    x = window.innerWidth - 100;
  }

  if (y > window.innerHeight) {
    y = window.innerHeight - 100;
  }

  if (y < 0) {
    y = 0;
  }
  return { x, y };
};
