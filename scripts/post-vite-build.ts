import { $, argv } from "bun";

// get the manifest file
const manifestFile = Bun.file("dist/manifest.json");
const manifest = await manifestFile.json();

// add the models to the web_accessible_resources
manifest.web_accessible_resources.push({
  resources: ["models/Xenova/multilingual-e5-small/*"],
  matches: ["<all_urls>"],
});

// build the prehook script (would use a non-available chrome.runtime.getURL() using standard bundling)
await $`bun build ./src/events-prehook.ts --outfile ./dist/assets/events-prehook.js`
await $`bun build ./src/activate.ts --outfile ./dist/assets/activate.js`

// update the manifest to use the prehook script
for (let i = 0; i < manifest.content_scripts.length; i++) {
  const contentScript = manifest.content_scripts[i];
  for (let j = 0; j < contentScript.js.length; j++) {
    const importSrc = contentScript.js[j];
    if (importSrc.indexOf('events-prehook') > -1) {
      contentScript.js[j] = 'assets/events-prehook.js'
    }
  }
}

// write the updated manifest
Bun.write("dist/manifest.json", JSON.stringify(manifest, null, 2));

console.log("Copying Xenova/multilingual-e5-small model currently DISABLED");

// remove the old model files
try {
await $`rm -r dist/assets/ort-wasm-simd-*`;
} catch (e) {}

// copy the models to the dist folder
//await $`mkdir -p dist/models/Xenova/multilingual-e5-small/`;
//await $`cp -R models/Xenova/multilingual-e5-small/* dist/models/Xenova/multilingual-e5-small/`;

// copy over ONNX runtime files
console.log("Copying ONNX runtime files currently DISABLED");
//await $`cp -R src/lib/worker/embedding/transformers/ort-wasm-simd-threaded.jsep.mjs dist/assets/`;
//await $`cp -R src/lib/worker/embedding/transformers/ort-wasm-simd-threaded.jsep.wasm dist/assets/`;
