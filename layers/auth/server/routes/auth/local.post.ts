import { defineOAuthLocalEventHandler } from "../../lib/oauth/local"

export default defineOAuthLocalEventHandler({
  config: {
    emailRequired: true
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      user,
      tokens
    })
  },
  // Optional, will return a json error and 401 status code by default
  onError(event, error) {
    console.error('Auth error:', error)
  },
})