import { verify } from "jsonwebtoken"
import type { Room, Rooms, TokensByUser } from "@/types"
import type { H3Event } from 'h3'

export function extractToken(authorizationHeader: string) {
  return authorizationHeader.startsWith('Bearer ')
    ? authorizationHeader.slice(7)
    : authorizationHeader
}

export async function getRoomsDB() {
  try {
    if (!await useStorage('db').hasItem('rooms.json')) {
      console.log('creating db file');

      await useStorage('db').setItem('rooms.json', JSON.stringify({}))
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to create DB'
    })
  }
  let rooms: Rooms | null = null
  try {
    rooms = await useStorage('db').getItem('rooms.json')
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to access DB'
    })
  }

  return rooms
}

export async function getTokensDB() {
  try {
    if (!await useStorage('db').hasItem('tokens.json')) {
      console.log('creating tokens file');

      await useStorage('db').setItem('tokens.json', JSON.stringify({}))
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to create Tokens'
    })
  }
  let tokens: Record<string, TokensByUser> | null = null
  try {
    tokens = await useStorage('db').getItem('tokens.json')
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to access Tokens'
    })
  }
  return tokens
}

export async function decodeToken(ctx: H3Event) {
  let authorizationHeader = getRequestHeader(ctx, 'Authorization')
  if (typeof authorizationHeader === 'undefined') {
    authorizationHeader = getCookie(ctx, 'auth.token')

    if (!authorizationHeader) {
      throw createError({ statusCode: 403, statusMessage: 'Need to pass valid authorization to access this endpoint' })
    }
  }

  const token = extractToken(authorizationHeader)
  let decoded: Room
  try {
    decoded = verify(token, useRuntimeConfig().authSecret) as Room
  }
  catch (error) {
    console.error({
      msg: 'Login failed. Here\'s the raw error:',
      error
    })
    throw createError({ statusCode: 403, statusMessage: 'You must be logged in to use this endpoint' })
  }

  // Check against known token
  const tokens = await getTokensDB()

  if (!tokens || !tokens[decoded.user].access[token]) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized, user is not logged in.'
    })
  }

  return { decoded, token }
}
