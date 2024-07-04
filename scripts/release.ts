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

try {
await $`rm -rf ./redaktool`;
await $`rm ./redaktool.zip`;

} catch (e) {
  //console.error(e);
}

const copyToReleaseFolder = async (filePath: string) => {
  const file = Bun.file(filePath);
  console.log(`Copying ${filePath}`)
  await Bun.write(`./redaktool/${filePath}`, file);
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

console.log(await $`zip -r redaktool.zip ./redaktool`.text());