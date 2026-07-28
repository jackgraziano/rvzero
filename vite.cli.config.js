import { defineConfig } from 'vite'

export default defineConfig({
  ssr: {
    noExternal: ['rvzero']
  },
  build: {
    outDir: 'dist-cli',
    emptyOutDir: true,
    target: 'node20',
    ssr: 'examples/cli/compare.mjs',
    minify: false,
    rollupOptions: {
      output: {
        entryFileNames: 'compare.mjs'
      }
    }
  }
})
