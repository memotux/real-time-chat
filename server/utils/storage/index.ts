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
async function setDB(key: string, data: string) {
  try {
    await useStorage('db').setItem(key, data)
  } catch (error) {
    console.error(error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Can not save data: ' + key
    })
  }
}

export async function getRoomsDB() {
  return getDB<RoomsDB>('rooms.json')
}
export async function saveRoomsDB(data: string) {
  await setDB('rooms.json', data)
}

export async function getTokensDB() {
  return getDB<TokensDB>('tokens.json')
}
export async function saveTokensDB(data: string) {
  await setDB('tokens.json', data)
}