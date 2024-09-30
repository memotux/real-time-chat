export default defineEventHandler(async (event) => {
  // All checks successful
  return isAuthUser(event)
})