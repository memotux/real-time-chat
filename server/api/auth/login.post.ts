import type { TokensByUser } from "@/types"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body is empty.'
    })
  }

  const result = validateLogin(body)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User or Room not valid'
    })
  }

  const { user, room } = result.data

  // If room not exist, create room
  let savedRoom = await getRoom(room)

  if (!savedRoom) {
    savedRoom = await createRoom(room)
  }

  // If user not in room, include user in room
  if (savedRoom && !(savedRoom.users.includes(user))) {
    savedRoom.users.push(user)
    await saveRoom(room, savedRoom)
  }

  // If user already have tokens, return saved tokens
  const savedTokens = await getUserTokens(user)

  if (savedTokens) {
    return {
      token: {
        accessToken: Object.keys(savedTokens.access)[0],
        refreshToken: Object.keys(savedTokens.refresh)[0]
      }
    }
  }

  // Generate new tokens
  const { accessToken, refreshToken } = generateTokens(result.data)

  const userTokens: TokensByUser = {
    access: {
      [accessToken]: refreshToken
    },
    refresh: {
      [refreshToken]: accessToken
    }
  }

  // Save new tokens on DB
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