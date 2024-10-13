import { sign, verify } from "jsonwebtoken"
import type { H3Event } from 'h3'
import { type CredentialsSchema, type VerifiedToken, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, credentialsSchema } from "../../types"

function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}

function getAuthToken(ctx: H3Event) {
  let authorizationHeader = getRequestHeader(ctx, 'Authorization')
  if (typeof authorizationHeader === 'undefined') {
    authorizationHeader = getCookie(ctx, 'auth.token')

    if (!authorizationHeader) {
      return null
    }
  }

  return extractToken(authorizationHeader)
}

export async function decodeToken(ctx: H3Event) {
  const token = getAuthToken(ctx)

  if (!token) return null

  let verifiedToken: VerifiedToken

  try {
    verifiedToken = verify(token, useRuntimeConfig().authSecret) as VerifiedToken
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
  const accessToken = sign(data, useRuntimeConfig().authSecret, {
    expiresIn: ACCESS_TOKEN_TTL
  })
  const refreshToken = sign(data, useRuntimeConfig().authSecret, {
    expiresIn: REFRESH_TOKEN_TTL
  })

  return {
    accessToken,
    refreshToken
  }
}

export async function isUserAuthorized(ctx: H3Event) {
  const token = await decodeToken(ctx)

  if (!token)
    throw createError({
      statusCode: 401,
      statusMessage: 'User not authorized.'
    })

  return token
}