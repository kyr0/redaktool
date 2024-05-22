import { resolve, relative } from "node:path";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { cwd } from "node:process";

// default log dir name
export const LOG_DIR_NAME = "logs";

export const log = (fileName: string, content: any, dirName = LOG_DIR_NAME) => {
  // create the directory if not exists
  if (!existsSync(dirName)) {
    mkdirSync(dirName, { recursive: true });
  }
  const path = resolve(dirName, fileName);
  writeFileSync(path, JSON.stringify(content, null, 2), {
    encoding: "utf-8",
  });

  // implement relative path using ESM to display a nice message
  // e.g. ./logs/output.json
  return `./${relative(cwd(), path)}`;
};
