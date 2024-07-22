import { defineConfig, rollupVersion } from 'vite'
import react from "@vitejs/plugin-react-swc";
import { crx, defineManifest } from '@crxjs/vite-plugin'
import manifestJson from './manifest.json'
import sourcemaps from 'rollup-plugin-sourcemaps';

const manifest = defineManifest(manifestJson);

export default defineConfig({
  assetsInclude: ["**/*.liquid"],
  build: {
    minify: false,
    rollupOptions: {
      treeshake: true,
      plugins: [
        sourcemaps({
          include: 'node_modules/**',
        }),
      ]
    },
    sourcemap: "inline"
  },
  plugins: [
    react(),
    crx({ manifest }),
  ],
})