export default defineEventHandler(async (event) => {
  const { decoded } = await decodeToken(event)
  return { ...decoded }
})