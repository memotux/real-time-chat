import type { RoomItem, TokensByUser } from "@@/types"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body) {
    console.error({ body });

    throw createError({
      statusCode: 400,
      statusMessage: 'Body is empty.'
    })
  }

  const result = validateLogin(body)

  if (!result.success) {
    console.error({ result });

    throw createError({
      statusCode: 400,
      statusMessage: 'User or Room not valid'
    })
  }

  const { user, room } = result.data
  let savedRoom: RoomItem | null

  // If room not exist, create room
  try {
    savedRoom = await getRoom(room)

    if (!savedRoom) {
      savedRoom = await createRoom(room)
    }
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Room can not be access.',
      data: { room }
    })
  }

  // If user not in room, include user in room
  if (savedRoom && !savedRoom.users.includes(user)) {
    savedRoom.users.push(user)
    try {
      const result = await saveRoom(room, savedRoom)
      if (!result) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Room can not be saved.',
          data: { room }
        })
      }
    } catch (error) {
      console.error(error);

      throw createError({
        statusCode: 500,
        statusMessage: 'Erro while saving room',
        data: { room }
      })
    }
  }

  // If user already have tokens, return saved tokens
  let savedTokens: TokensByUser | null
  try {
    savedTokens = await getUserTokens(user)
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Error while getting saved user tokens.'
    })
  }

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
    console.error(error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Error saving new tokens.'
    })
  }

  return {
    token: {
      accessToken,
      refreshToken
    }
  }
})