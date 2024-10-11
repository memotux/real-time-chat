import type { TokensDB } from "@/types"

export default defineEventHandler(async (event) => {
  const { user } = await isUserAuthorized(event)

  const tokens = await getTokensDB()

  if (!tokens || !tokens[user])
    throw createError({
      statusCode: 401,
      statusMessage: 'User not logged in.'
    })

  const filteredTokens: TokensDB = Object.fromEntries(
    Object.entries(tokens).filter((token) => token[0] !== user))


  const updatedTokens = await saveTokensDB(filteredTokens)

  if (!updatedTokens)
    throw createError({
      statusCode: 500,
      statusMessage: 'Error updating tokens.'
    })


  return { status: 'logout' }
})
