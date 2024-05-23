import { buildForBrowser } from '@jsheaven/easybuild'

//  bun build ./src/content-script.tsx --loader .css:text --outfile=./dist/content-script.js --outdir=./dist

console.log('Building... content-script.tsx')

const result = await Bun.build({
  entrypoints: ['./src/content-script.tsx'],
  outdir: './dist',
  target: 'browser',
  loader: {
    '.css': 'text',
  },
  format: 'esm',
  external: ['chrome'],
})

await buildForBrowser({
  // source file to build
  entryPoint: './dist/content-script.js',
  // file to generate (actually, generates invariants like ./dist/cli.iife.js, etc.)
  outfile: './dist/content-script.cjs',
  // allows to disable all minification and tree shaking with one flag
  debug: false,
  // generated .d.ts files, but drives the build-time and may cause typing errors
  dts: false,
  // in case you want to set any extra esbuild options
  esBuildOptions: {
    // usually, Node.js builds are not bundled, but e.g. for CLIs you want that
    bundle: false,
  },
})


if (result.success) {
  console.log('Build succeeded')
}

if (!result.success) {
  console.error('Build failed')
  for (const message of result.logs) {
    // Bun will pretty print the message object
    console.error(message)
  }
}

