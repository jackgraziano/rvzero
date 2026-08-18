import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const repositoryRoot = fileURLToPath(new URL('.', import.meta.url))

function readBuildSha() {
  try {
    const sha = readFileSync(new URL('.shasha', import.meta.url), 'utf8').trim()
    if (/^[0-9a-f]+$/i.test(sha)) return sha
  } catch {
    // The first Shasha commit has not been created yet.
  }

  try {
    return execFileSync('git', ['rev-parse', '--short=6', 'HEAD'], {
      cwd: repositoryRoot,
      encoding: 'utf8'
    }).trim()
  } catch {
    return 'desenvolvimento'
  }
}

export default defineConfig({
  plugins: [vue()],
  define: {
    __SHASHA__: JSON.stringify(readBuildSha())
  },
  server: {
    host: '0.0.0.0',
    port: 8080
  },
  base: '/'
})
