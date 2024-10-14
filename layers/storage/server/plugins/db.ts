export default defineNitroPlugin(async () => {
  try {
    const tokens = await createTokensDB()
    const rooms = await createRoomsDB()

    if (!tokens || !rooms) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to create DB during init.',
        data: { tokens, rooms }
      })
    }
  } catch (error) {
    console.error(error);

    throw createError({
      statusCode: 500,
      statusMessage: 'Error while initializing DBs.'
    })
  }
})
