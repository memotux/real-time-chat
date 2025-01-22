export default defineEventHandler(async (event) => {
  const token = await decodeToken(event)

  if (token) {
    return { ...token.decoded }
  }

  return null
})