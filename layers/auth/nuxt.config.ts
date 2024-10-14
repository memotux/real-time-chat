// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  build: {
    transpile: ['jsonwebtoken']
  },
  modules: ['@sidebase/nuxt-auth'],
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
  }
})