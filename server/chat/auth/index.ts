import { sign, verify } from "jsonwebtoken"
import type { Room } from "@/types"
import type { H3Event } from 'h3'
import { type CredentialsSchema, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, credentialsSchema } from "../types"

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
      throw createError({ statusCode: 403, statusMessage: 'Need to pass valid authorization to access this endpoint' })
    }
  }

  return extractToken(authorizationHeader)
}

export async function decodeToken(ctx: H3Event) {
  const token = getAuthToken(ctx)

  let decoded: Room

  try {
    decoded = verify(token, useRuntimeConfig().authSecret) as Room
  }
  catch (error) {
    console.error({
      msg: 'Token not valid.',
      error
    })
    throw createError({
      statusCode: 403,
      statusMessage: 'You must be logged in to use this endpoint'
    })
  }

  return { user: decoded.user, room: decoded.room, decoded, token }
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