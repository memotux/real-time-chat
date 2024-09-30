export default defineEventHandler(async (event) => {
  const decoded = await isAuthUser(event)

  const tokens = await getTokensDB()

  if (!tokens || !tokens[decoded.user]) return

  await useStorage('db').setItem('tokens.json', JSON.stringify({ ...tokens, [decoded.user]: undefined }))

  return { status: 'ok' }
})
