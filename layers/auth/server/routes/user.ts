import { tokenFromHeader } from "../utils"

export default defineEventHandler(async (event) => {
  const token = await tokenFromHeader(event)

  if (token) return token

  return null
})