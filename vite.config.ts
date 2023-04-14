import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts({
    copyDtsFiles: true
  })],
  // root: 'example',
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'ant-border.js',
      formats: ['cjs', 'es']
    }
  }
})
