import { z } from "zod"
import { sign } from 'jsonwebtoken'

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

  const rooms = await getRoomsDB()

  let updateDB = false

  if (rooms && !(room in rooms)) {
    // create room with empty array
    rooms[room] = { users: [], messages: [] }
    updateDB = true
  }
  if (rooms && !(rooms[room].users.includes(user))) {
    rooms[room].users.push(user)
    updateDB = true
  }

  if (updateDB) {
    try {
      await useStorage('db')
        .setItem(
          'rooms.json',
          JSON.stringify({ ...rooms })
        )
    } catch (error) {
      console.log(error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Error updating DB.'
      })
    }
  }

  const tokens = await getTokensDB()

  if (tokens) {
    if (user in tokens) {
      return {
        token: {
          accessToken: Object.keys(tokens[user].access)[0],
          refreshToken: Object.keys(tokens[user].refresh)[0]
        }
      }
    }

    const accessToken = sign(result.data, useRuntimeConfig().authSecret, {
      expiresIn: ACCESS_TOKEN_TTL
    })
    const refreshToken = sign(result.data, useRuntimeConfig().authSecret, {
      // 1 day
      expiresIn: 60 * 60 * 24
    })

    // create tokens with empty object
    tokens[user] = { access: {}, refresh: {} }
    tokens[user].access[accessToken] = refreshToken
    tokens[user].refresh[refreshToken] = accessToken
    try {
      await useStorage('db')
        .setItem(
          'tokens.json',
          JSON.stringify({ ...tokens })
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
  }
})