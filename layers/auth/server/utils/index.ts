import { sign, verify } from "jsonwebtoken"
import type { H3Event } from 'h3'
import { type CredentialsSchema, type VerifiedToken, ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, credentialsSchema } from "../../types"
import type { TokensDB } from "~~/types";

export async function tokenFromHeader(ctx: H3Event) {
  let token = getRequestHeader(ctx, 'Authorization')

  if (!token) return null

  token = token.slice(7)

  let verifiedToken: VerifiedToken

  try {
    verifiedToken = verify(token, useRuntimeConfig().oauth.local.clientSecret) as VerifiedToken
  }
  catch (error) {
    console.error(error)
    return null
  }

  return verifiedToken
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

export async function clearTokens(user: string) {
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