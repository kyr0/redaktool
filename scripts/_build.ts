const { exec } = require('child_process')
import { extname, dirname, sep } from 'path'
import { readFile } from 'fs/promises'
import { build, type BuildOptions, type Loader, type Plugin } from 'esbuild'

/** makes sure that all __dirname and __filename occurances are replaced why the actual filenames */
export const esmDirnamePlugin: Plugin = {
  name: 'esmDirname',
  setup(build) {
    const nodeModules = new RegExp(/^(?:.*[\\\/])?node_modules(?:[\\\/].*)?$/)
    build.onLoad({ filter: /.*/ }, async ({ path }) => {
      if (!path.match(nodeModules)) {
        let contents = await readFile(path, 'utf8')
        const loader = extname(path).substring(1) as Loader
        const _dirname = dirname(path)
        contents = contents.replaceAll('__dirname', `"${_dirname}"`).replaceAll('__filename', `"${path}"`)
        return {
          contents,
          loader,
        }
      }
    })
  },
}

/** default baseConfig for esbuild */
export const baseConfig: BuildOptions = {
  sourcemap: 'linked',
  target: 'esnext',
  bundle: true,
  minify: true,
  minifySyntax: true,
  minifyIdentifiers: true,
  minifyWhitespace: true,
  legalComments: 'none',
}


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

await build({
  format: 'cjs',
  entryPoints: ['./dist/content-script.js'],
  outfile: './dist/content-script.cjs.js',
  sourcemap: false,
  target: 'esnext',
  bundle: false,
  minify: false,
  minifySyntax: false,
  minifyIdentifiers: false,
  minifyWhitespace: false,
  platform: 'browser',
  plugins: [esmDirnamePlugin],
  legalComments: 'none',
} as BuildOptions)


/*

if (result.success) {
  console.log('Build succeeded')
  exec(`sed -i '' 's/Bun.env.API_KEY/"${Bun.env.API_KEY}"/g' ./dist/src/content.js`)
}

if (!result.success) {
  console.error('Build failed')
  for (const message of result.logs) {
    // Bun will pretty print the message object
    console.error(message)
  }
}
*/