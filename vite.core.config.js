import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    outDir: 'dist-core',
    emptyOutDir: true,
    target: 'es2022',
    lib: {
      entry: 'src/core/index.js',
      formats: ['es'],
      fileName: () => 'index.js'
    }
  }
})
