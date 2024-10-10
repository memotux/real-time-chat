import type { RoomsDB, StorageValue, TokensDB } from "@/types";
import type { StorageItemKey } from "../types";

/**
 * Validate if DB exist
 * 
 * @param key { StorageItemKey } storage item key
 * 
 * @returns { Promise<boolean> } A Promise if DB key exist or not
 */
export async function existDB(key: StorageItemKey): Promise<boolean> {
  return useStorage('db').hasItem(key)
}

/**
 * Create DB with key as name, and empty object as content
 * if key exist
 * 
 * @param key { StorageItemkey } storage item key
 * 
 * @returns { Promise<null | void> } Resolve to key string if succesfull. Otherwise resolve NULL if key not exist or there is an error creating the item
 */
export async function createDB(key: StorageItemKey): Promise<string | null> {
  try {
    if (!await existDB(key)) {
      await useStorage('db').setItem(key, '{}')
      return key
    } else {
      return null
    }
  } catch (error) {
    console.error(error);
    return null
  }
}

/**
 * Get DB item with key name
 * 
 * @param key {StorageItemKey} storage item key
 * @returns {Promise<D | null>} Promise could resolve NULL if key not exist, content not exist or there is an error on get item. Otherwise return item content.
 */
export async function getDB<D extends StorageValue = RoomsDB | TokensDB>(key: StorageItemKey): Promise<D | null> {
  try {
    if (await existDB(key)) {
      return useStorage('db').getItem<D>(key)
    } else {
      return null
    }
  } catch (error) {
    console.error(error)
    return null
  }
}

/**
 * Set DB item key with data
 * 
 * @param key { StorageKey } storage key item
 * @param data { RoomsDB | TokensDB } data to be stored in storage key
 * @returns { Promise<void | null> } Promise could resolve NULL if key not exist or there is error
 */
export async function setDB(key: StorageItemKey, data: RoomsDB | TokensDB): Promise<RoomsDB | TokensDB | null> {
  try {
    if (await existDB(key)) {
      await useStorage('db').setItem(key, JSON.stringify(data))
      return data
    } else {
      return null
    }
  } catch (error) {
    console.error(error);
    return null
  }
}