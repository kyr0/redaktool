import { defineConfig } from 'vite'
import react from "@vitejs/plugin-react-swc";
import { crx, defineManifest } from '@crxjs/vite-plugin'
import manifestJson from './manifest.json'

const manifest = defineManifest(manifestJson);

export default defineConfig({
  assetsInclude: ["**/*.liquid"],
  build: {
    sourcemap: "inline"
  },
  plugins: [
    react(),
    crx({ manifest }),
  ],
})