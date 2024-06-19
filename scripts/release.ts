import { ConfigOpts } from './../release/node_modules/openai-fetch/dist/openai-client.d';
import { Glob, $ } from "bun";

const glob = new Glob("**/*");

const whiteList = [
  "dist/",
  "public/",
  "css/",
  "icons/",
  "fonts/",
  "@webcomponents/",
  "popup.html",
  "manifest.json",
  "LICENSE",
  "sandbox.html",
  "CHANGELOG.md",
  "src/browser-polyfill.js",
];

const blackList = [
  "node_modules/",
]

await $`rm -rf ./release`;

const copyToReleaseFolder = async (filePath: string) => {
  const file = Bun.file(filePath);
  console.log(`Copying ${filePath}`)
  await Bun.write(`./redaktool_nightly/${filePath}`, file);
}

for await (const filePath of glob.scan(".")) {
  if (filePath.includes("@webcomponents/")) {
    copyToReleaseFolder(filePath);
  }
}

for await (const filePath of glob.scan(".")) {
  if (whiteList.some((pattern) => filePath.includes(pattern)) && !blackList.some((pattern) => filePath.includes(pattern))){
    copyToReleaseFolder(filePath);
  }
}

const zip = await $`zip -r redaktool_nightly.zip ./redaktool_nightly`.text();

console.log(zip);