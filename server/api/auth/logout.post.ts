export default defineEventHandler(async (event) => {
  const { decoded } = await decodeToken(event)

  const tokens = await getTokensDB()

  if (!tokens || !tokens[decoded.user]) return

  await saveTokensDB(JSON.stringify({ ...tokens, [decoded.user]: undefined }))

  return { status: 'ok' }
})
