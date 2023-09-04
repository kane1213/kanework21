import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { globSync } from "glob"
// https://vitejs.dev/config/



// x.replace(/src\/pages\/(.*)\/index.jsx?/, "$1")

// import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'DATA_DIRECTORY': globSync('./public/music/midi/*.mid').map((path: string) => path.replace(/public\\music\\midi\\(.*).midi?/, "$1")),
  }
})
