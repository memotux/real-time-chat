import { RoomsDB, StorageValue, TokensDB } from "@/types";

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

async function getDB<D extends StorageValue = RoomsDB | TokensDB>(key: string) {
  validateDB(key)

  try {
    return useStorage('db').getItem<D>(key)
  } catch (error) {
    console.error(error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to access DB'
    })
  }
}

export async function getRoomsDB() {
  return getDB<RoomsDB>('rooms.json')
}

export async function getTokensDB() {
  return getDB<TokensDB>('tokens.json')
}