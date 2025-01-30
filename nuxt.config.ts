// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  modules: ['@nuxt/ui', '@vueuse/nuxt'],
  nitro: {
    experimental: {
      websocket: true
    }
  },
  app: {
    head: {
      title: 'Tux Chat'
    }
  }
})