import type { TokensDB } from "@/types"

export default defineEventHandler(async (event) => {
  const { user } = await decodeToken(event)

  const tokens = await getTokensDB()

  if (!tokens || !tokens[user]) return { status: 'tokens not exist' }

  const updateTokens: TokensDB = Object.fromEntries(
    Object.entries(tokens).filter((token) => token[0] !== user))

  await saveTokensDB(updateTokens)

  return { status: 'ok' }
})
