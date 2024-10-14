import type { RoomItem, RoomsDB, TokensByUser, TokensDB } from "@@/types";
import { getDB, setDB, createDB } from "../adapters";
import { StorageItemKey } from "../../types";

/**
 * Get saved Rooms DB
 * @returns { Promise<RoomDB | null> } Promise that resolve with `RoomsDB` or `null`
 */
export async function getRoomsDB(): Promise<RoomsDB | null> {
  return getDB<RoomsDB>(StorageItemKey.ROOMS)
}

/**
 * Save `data` on RoomsDB
 * @param data { RoomsDB } Rooms DB data to be saved.
 * @returns { Promise<RoomsDB | null> } Promise that resolve with `RoomsDB` or `null`
 */
export async function saveRoomsDB(data: RoomsDB): Promise<RoomsDB | null> {
  return setDB(StorageItemKey.ROOMS, data)
}

/**
 * Create RoomsDB file
 * @param data { RoomsDB } Rooms DB data to be saved.
 * @returns { Promise<StorageItemKey | null> } Promise that resolve with `StorageItemKey` or `null`
 */
export async function createRoomsDB(): Promise<StorageItemKey | null> {
  return createDB(StorageItemKey.ROOMS)
}

/**
 * Get `RoomItem` by name, if exist.
 * @param room { string } Room name provided by user
 * @returns { Promise<RoomItem | null> } Promise that resolve with `RoomItem` if exist, `null` otherwise.
 */
export async function getRoom(room: string): Promise<RoomItem | null> {
  const currentRoom = await existRoom(room)

  if (currentRoom) {
    return currentRoom
  }

  return null
}

/**
 * Confirm if `room` exist in `RoomsDB`
 * @param room { string } Room name provided by user
 * @returns { Promise<RoomItem | null> } Promise that resolve with `RoomItem` if exist, `null` otherwise.
 */
export async function existRoom(room: string): Promise<RoomItem | null> {
  const rooms = await getRoomsDB()

  if (rooms && rooms[room]) {
    return rooms[room]
  }

  return null
}

/**
 * Create `room` in `RoomsDB`, if `room` doesn't already exist.
 * @param room { string } Room name provided by user
 * @param data { Optional<RoomItem> } Optional data to be saved in room
 * @returns { Promise<RoomItem | null> } Promise that resolve with `RoomItem` or `null`
 */
export async function createRoom(room: string, data?: RoomItem): Promise<RoomItem | null> {
  const rooms = await getRoomsDB()

  if (rooms && !(room in rooms)) {
    rooms[room] = data || { users: [], messages: [] }
    await saveRoomsDB(rooms)
    return rooms[room]
  }

  return null
}

/**
 * 
 * @param room { string } Room name provided by user
 * @param data { RoomItem } Data to be saved in `room`
 * @returns { Promise<RoomItem | null> } Promise that resolve with `RoomItem` if `room` exist. `null` otherwise.
 */
export async function saveRoom(room: string, data: RoomItem): Promise<RoomItem | null> {
  const currentRoom = await existRoom(room)

  if (currentRoom) {
    const rooms = await getRoomsDB()
    if (rooms) {
      rooms[room] = data
      await saveRoomsDB(rooms)
      return rooms[room]
    }
  }

  return null
}

/**
 * Get `TokensDB`, if exist
 * @returns { Promise<TokensDB | null> } Promise that resolve `TokensDB` or `null`
 */
export async function getTokensDB(): Promise<TokensDB | null> {
  return getDB<TokensDB>(StorageItemKey.TOKENS)
}

/**
 * Save `TokensDB` data
 * @param data { TokensDB } Data to be saved in DB
 * @returns { Promise<TokensDB | null> } Promise that resolve `TokensDB` or `null`
 */
export async function saveTokensDB(data: TokensDB): Promise<TokensDB | null> {
  return setDB(StorageItemKey.TOKENS, data)
}

/**
 * Create Tokens DB
 * @returns { Promise<StorageItemKey | null> } Promise that resolve with `StorageItemKey` or `null`
 */
export async function createTokensDB(): Promise<StorageItemKey | null> {
  return createDB(StorageItemKey.TOKENS)
}

/**
 * Get User Tokens, if exist
 * @param user { string } User name
 * @returns { Promise<TokensByUser | null> } Promise that resolve with `TokensByUser` or `null`
 */
export async function getUserTokens(user: string): Promise<TokensByUser | null> {
  const tokens = await getTokensDB()

  if (tokens && tokens[user]) {
    return tokens[user]
  }

  return null
}

/**
 * Save User Tokens in DB
 * @param user { string } User name
 * @param data { TokensByUser } Data to be saved
 * @returns { Promise<TokensByUser | null> } Promise that resolve with `TokensByUser` or `null`
 */
export async function saveUserTokens(user: string, data: TokensByUser): Promise<TokensByUser | null> {
  const tokens = await getTokensDB()

  if (tokens) {
    tokens[user] = data
    if (await saveTokensDB(tokens)) {
      return tokens[user]
    }
    return null
  }

  return null
}
