export default defineNuxtConfig({
  nitro: {
    storage: {
      db: {
        driver: 'fs',
        base: './data/tuxchat'
      }
    }
  }
})