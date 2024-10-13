import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const currentDir = dirname(fileURLToPath(import.meta.url))

export default defineNuxtConfig({
  nitro: {
    imports: {
      dirs: [join(currentDir, './server/auth/*')]
    }
  }
})