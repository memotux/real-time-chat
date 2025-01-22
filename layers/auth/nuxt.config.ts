// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['jsonwebtoken']
  },
  modules: ['nuxt-auth-utils'],
  runtimeConfig: {
    oauth: {
      local: {
        clientSecret: '',
        domain: ''
      }
    }
  }
})