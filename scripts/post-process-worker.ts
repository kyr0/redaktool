/*
const file = Bun.file("./dist/background.worker.js");
let text = await file.text();

text = text.replace(`var isEmpty = function(obj) {
  return Object.keys(obj).length === 0;
};`, `var isEmpty = function(obj) {
  if (typeof obj === "undefined") return true;
  return Object.keys(obj).length === 0;
};`).replace(`import * as ONNX_NODE from "onnxruntime-node"`, "var ONNX_NODE = undefined;");
await Bun.write("./dist/background.worker.js", text);
*/

// --external=onnxruntime-node --external=onnxruntime-common/dist/ort-common.node.js --target=browser --define=import.meta:{}

// DEPRECATED
import { Glob, $ } from "bun";

// copy WASM files over to dist folder
const glob = new Glob("node_modules/onnxruntime-web/dist/*.wasm");
import { basename } from "path";

const copyToDistFolder = async (filePath: string) => {
  const file = Bun.file(filePath);
  console.log(`Copying ${filePath}`)
  await Bun.write(`./dist/${basename(filePath)}`, file);
}

for await (const filePath of glob.scan(".")) {
  copyToDistFolder(filePath);
}
