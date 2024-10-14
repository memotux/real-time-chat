// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  future: {
    compatibilityVersion: 4
  },
  build: {
    transpile: ['jsonwebtoken']
  },
  modules: ['@nuxt/ui', '@sidebase/nuxt-auth'],
  runtimeConfig: {
    authSecret: ''
  },
  auth: {
    provider: {
      type: 'local',
      endpoints: {
        signIn: { path: '/login', method: 'post' },
        signOut: { path: '/logout', method: 'post' },
        getSession: { path: '/session', method: 'get' },
      },
      token: {
        signInResponseTokenPointer: '/token/accessToken'
      },
      pages: {
        login: '/'
      },
      session: {
        dataType: {
          room: 'string',
          user: 'string',
        },
      },
    }
  },
  nitro: {
    experimental: {
      websocket: true
    },
    imports: {
      dirs: ['./server/chat/**/index.ts']
    }
  }
})