import { z } from "zod"
import { sign } from 'jsonwebtoken'
import type { TokensByUser } from "@/types"

/** 3600 seconds */
export const ACCESS_TOKEN_TTL = 60 * 60

const credentialsSchema = z.object({
  user: z.string().min(3),
  room: z.string().min(3)
})

export default defineEventHandler(async (event) => {
  const result = credentialsSchema.safeParse(await readBody(event))
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User or Room not valid'
    })
  }

  const { user, room } = result.data

  // If room not exist create it
  let savedRoom = await getRoom(room)

  if (!savedRoom) {
    savedRoom = await createRoom(room)
  }

  // If user not in room, include it
  if (savedRoom && !(savedRoom.users.includes(user))) {
    savedRoom.users.push(user)
    await saveRoom(room, savedRoom)
  }

  // If user already have tokens, return it
  const savedTokens = await getUserTokens(user)

  if (savedTokens) {
    return {
      token: {
        accessToken: Object.keys(savedTokens.access)[0],
        refreshToken: Object.keys(savedTokens.refresh)[0]
      }
    }
  }

  // Create new tokens
  const accessToken = sign(result.data, useRuntimeConfig().authSecret, {
    expiresIn: ACCESS_TOKEN_TTL
  })
  const refreshToken = sign(result.data, useRuntimeConfig().authSecret, {
    // 1 day
    expiresIn: 60 * 60 * 24
  })

  const userTokens: TokensByUser = {
    access: {
      [accessToken]: refreshToken
    },
    refresh: {
      [refreshToken]: accessToken
    }
  }

  try {
    await saveUserTokens(
      user,
      userTokens
    )
  } catch (error) {
    console.log(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating DB.'
    })
  }

  return {
    token: {
      accessToken,
      refreshToken
    }
  }
})