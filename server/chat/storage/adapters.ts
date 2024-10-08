import type { RoomsDB, StorageValue, TokensDB } from "@/types";

/**
 * Validate if DB exist
 * @param key { string } storage item key
 * @returns Promise { boolean }
 */
export async function existDB(key: string) {
  return useStorage('db').hasItem(key)
}

export async function createDB(key: string) {
  if (!await existDB(key)) {
    await useStorage('db').setItem(key, JSON.stringify({}))
  }
}

export async function getDB<D extends StorageValue = RoomsDB | TokensDB>(key: string) {
  try {
    if (await existDB(key)) {
      return useStorage('db').getItem<D>(key)
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Unable to access DB'
    })
  } catch (error) {
    console.error(error)
  }
}

export async function setDB(key: string, data: RoomsDB | TokensDB) {
  try {
    if (await existDB(key)) {
      return await useStorage('db').setItem(key, JSON.stringify(data))
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Can not save data: ' + key
    })
  } catch (error) {
    console.error(error);
  }
}