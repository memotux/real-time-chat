export default defineNitroPlugin(async () => {
  try {
    await createTokensDB()
    await createRoomsDB()
  } catch (error) {
    console.error(error);
  }
})
