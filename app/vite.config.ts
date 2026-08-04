import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), basicSsl(), process.env.ANALYZE && visualizer({ open: true, gzipSize: true })],
  server: {
    host: true,
  },
})
