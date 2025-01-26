import type { H3Event } from 'h3'
import { eventHandler } from 'h3'
import { defu } from 'defu'
// @ts-ignore
// import { handleMissingConfiguration, handleAccessTokenErrorResponse, getOAuthRedirectURL, requestAccessToken } from 'nuxt-auth-utils/dist/runtime/server/lib/utils'
import { useRuntimeConfig } from '#imports'
import type { OAuthConfig } from '#auth-utils'
import type { Room } from '~~/types'

export interface OAuthLocalConfig {
  /**
   * Local OAuth Client ID
   * @default process.env.NUXT_OAUTH_LOCAL_CLIENT_ID
   */
  // clientId?: string
  /**
   * Local OAuth Client Secret
   * @default process.env.NUXT_OAUTH_LOCAL_CLIENT_SECRET
   */
  clientSecret?: string
  /**
   * Local OAuth Issuer
   * @default process.env.NUXT_OAUTH_LOCAL_DOMAIN
   */
  domain?: string
  /**
   * Local OAuth Audience
   * @default process.env.NUXT_OAUTH_LOCAL_AUDIENCE
   */
  audience?: string
  /**
   * Local OAuth Scope
   * @default []
   * @see https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes
   * @example ['openid']
   */
  scope?: string[]
  /**
   * Require email from user, adds the ['email'] scope if not present
   * @default false
   */
  emailRequired?: boolean
  /**
   * Maximum Authentication Age. If the elapsed time is greater than this value, the OP must attempt to actively re-authenticate the end-user.
   * @default 0
   * @see https://auth0.com/docs/authenticate/login/max-age-reauthentication
   */
  maxAge?: number
  /**
   * Login connection. If no connection is specified, it will redirect to the standard Local login page and show the Login Widget.
   * @default ''
   * @see https://auth0.com/docs/api/authentication#social
   * @example 'github'
   */
  connection?: string
  /**
   * Extra authorization parameters to provide to the authorization URL
   * @see https://auth0.com/docs/api/authentication#social
   * @example { display: 'popup' }
   */
  authorizationParams?: Record<string, string>
  /**
   * Redirect URL to to allow overriding for situations like prod failing to determine public hostname
   * @default process.env.NUXT_OAUTH_LOCAL_REDIRECT_URL or current URL
   */
  redirectURL?: string
}

export function defineOAuthLocalEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthLocalConfig>) {
  return eventHandler(async (event: H3Event) => {
    // @ts-ignore
    config = defu(config, useRuntimeConfig(event).oauth?.local, {
      authorizationParams: {},
    }) as OAuthLocalConfig

    if (!config.clientSecret || !config.domain) {
      // return handleMissingConfiguration(event, 'local', ['clientSecret', 'domain'], onError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Missing Configuration.'
      })
    }
    // const authorizationURL = `${config.domain}/authorize`
    const tokenURL = `${config.domain}/token`

    const body = await readBody<Room>(event)
    const redirectURL = config.redirectURL /* || getOAuthRedirectURL(event) */

    // if (!query.code) {
    //   config.scope = config.scope || ['openid', 'offline_access']
    //   if (config.emailRequired && !config.scope.includes('email')) {
    //     config.scope.push('email')
    //   }
    //   // Redirect to Local Oauth page
    //   return sendRedirect(
    //     event,
    //     withQuery(authorizationURL as string, {
    //       response_type: 'code',
    //       client_domain: config.domain,
    //       redirect_uri: redirectURL,
    //       scope: config.scope.join(' '),
    //       audience: config.audience || '',
    //       max_age: config.maxAge || 0,
    //       connection: config.connection || '',
    //       ...config.authorizationParams,
    //     }),
    //   )
    // }

    const tokens = await $fetch<any>(tokenURL as string, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        grant_type: 'authorization_code',
        client_domain: config.domain,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        ...body
        // code: query.code,
      },
    })


    if (tokens.error) {
      console.error(tokens)
      // return handleAccessTokenErrorResponse(event, 'local', tokens, onError)
    }

    const tokenType = 'Bearer'
    const { accessToken } = tokens.token

    // TODO: improve typing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const user: any = await $fetch(`${config.domain}/user`, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`,
      },
    })

    return onSuccess(event, {
      tokens: tokens.token,
      user,
    })
  })
}