import { sign, verify } from "jsonwebtoken"
import { parse } from "cookie-es";
import type { H3Event } from 'h3'
import { type CredentialsSchema, type VerifiedToken, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, credentialsSchema } from "../../types"
import type { TokensDB } from "~~/types";

function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}

async function getAuthToken(ctx: H3Event | Request) {
  let authorizationHeader = null

  if (isEvent(ctx)) {
    authorizationHeader = getRequestHeader(ctx, 'Authorization')
    if (typeof authorizationHeader === 'undefined') {
      authorizationHeader = getCookie(ctx, 'nuxt-session')
    }
  } else {
    authorizationHeader = ctx.headers.get('Authorization')
    if (authorizationHeader === null) {
      const sealSession = parse(ctx.headers?.get('cookie') || '')['nuxt-session']
      const { data } = await unsealSession(ctx as unknown as H3Event, useRuntimeConfig().session, sealSession!)

      authorizationHeader = data?.tokens?.accessToken || null
    }
  }

  if (!authorizationHeader) {
    return null
  }

  return extractToken(authorizationHeader)
}

export async function decodeToken(ctx: H3Event | Request) {
  const token = await getAuthToken(ctx)

  if (!token) return null

  let verifiedToken: VerifiedToken

  try {
    verifiedToken = verify(token, useRuntimeConfig().oauth.local.clientSecret) as VerifiedToken
  }
  catch (error) {
    console.error(error)
    return null
  }

  return { user: verifiedToken.user, room: verifiedToken.room, decoded: verifiedToken, token }
}

export function validateLogin(data: CredentialsSchema) {
  return credentialsSchema.safeParse(data)
}

export function generateTokens(data: CredentialsSchema) {
  const accessToken = sign(data, useRuntimeConfig().oauth.local.clientSecret, {
    expiresIn: ACCESS_TOKEN_TTL
  })
  const refreshToken = sign(data, useRuntimeConfig().oauth.local.clientSecret, {
    expiresIn: REFRESH_TOKEN_TTL
  })

  return {
    accessToken,
    refreshToken
  }
}

export async function isUserAuthorized(ctx: Request) {
  const token = await decodeToken(ctx)

  if (!token)
    throw createError({
      statusCode: 401,
      statusMessage: 'User not authorized.'
    })

  return token
}

export async function clearTokens(ctx: Request) {
  const { user } = await isUserAuthorized(ctx)

  const tokens = await getTokensDB()

  if (!tokens || !tokens[user])
    throw createError({
      statusCode: 401,
      statusMessage: 'User not logged in.'
    })

  const filteredTokens: TokensDB = Object.fromEntries(
    Object.entries(tokens).filter((token) => token[0] !== user))

  const updatedTokens = await saveTokensDB(filteredTokens)

  if (!updatedTokens)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating tokens.'
    })

  return { status: 'logout' }
}