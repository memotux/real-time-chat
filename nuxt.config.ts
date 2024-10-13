// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  nitro: {
    experimental: {
      websocket: true
    },
    storage: {
      db: {
        driver: 'fs',
        base: './data/tuxchat'
      }
    }
  }
})