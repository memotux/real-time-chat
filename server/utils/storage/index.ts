import { RoomsDB, TokensDB } from "@/types";

async function existDB(key: string) {
  return useStorage('db').hasItem(key)
}

async function createDB(key: string) {
  return useStorage('db').setItem(key, JSON.stringify({}))
}

async function validateDB(key: string) {
  try {
    if (!await existDB(key)) {
      console.log('creating db file: ', key);

      await createDB(key)
    }
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to create DB: ' + key
    })
  }
}

async function getDB<D>(key: string) {
  validateDB(key)

  try {
    return await useStorage('db').getItem(key) as D
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to access DB'
    })
  }
}

export async function getRoomsDB() {
  return await getDB<RoomsDB>('rooms.json')
}

export async function getTokensDB() {
  return await getDB<TokensDB>('tokens.json')
}