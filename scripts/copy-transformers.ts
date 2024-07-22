import { $ } from "bun";
import { readFileSync, writeFileSync } from "fs";

await $`cp -R ../transformers.js/dist/* src/lib/worker/embedding/transformers/`;
await $`cp -R ../transformers.js/types/* src/lib/worker/embedding/transformers/`;

await $`cp -R node_modules/onnxruntime-web/dist/ort-* src/lib/worker/embedding/transformers/`;

let runtime = readFileSync("src/lib/worker/embedding/transformers/ort-wasm-simd-threaded.jsep.mjs", "utf8")

// fix: top-level await is not allowed in Workers...
runtime = runtime.replace("if (isNode) isPthread = (await import('worker_threads')).workerData === 'em-pthread';", 
  "")
writeFileSync("src/lib/worker/embedding/transformers/ort-wasm-simd-threaded.jsep.mjs", runtime)

let transformersJs = readFileSync('src/lib/worker/embedding/transformers/transformers.js', 'utf8')
// fix "document" not available in web worker error
transformersJs = transformersJs.replace(/document\.baseURI/g, 'self.location.href')
// allow to import wasm module using inversion of control: loader function can now be passed down via env
transformersJs = transformersJs.replace(/importWasmModule\(/g, '(typeof env.importWasmModule === "function" ? env.importWasmModule : importWasmModule)(')
writeFileSync('src/lib/worker/embedding/transformers/transformers.js', transformersJs)