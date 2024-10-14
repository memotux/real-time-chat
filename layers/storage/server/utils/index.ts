import type { RoomItem, RoomsDB, TokensByUser, TokensDB } from "@@/types";
import { getDB, setDB, createDB } from "../adapters";
import { StorageItemKey } from "../../types";

/**
 * Rooms Use Cases
*/

export async function getRoomsDB() {
  return getDB<RoomsDB>(StorageItemKey.ROOMS)
}

export async function saveRoomsDB(data: RoomsDB) {
  return setDB(StorageItemKey.ROOMS, data)
}

export async function createRoomsDB() {
  return createDB(StorageItemKey.ROOMS)
}

export async function getRoom(room: string) {
  const currentRoom = await existRoom(room)
  if (currentRoom) {
    return currentRoom
  }

  return null
}

export async function existRoom(room: string) {
  const rooms = await getRoomsDB()
  if (rooms && rooms[room]) {
    return rooms[room]
  }

  return null
}

export async function createRoom(room: string, data?: RoomItem) {
  const rooms = await getRoomsDB()

  if (rooms && !(room in rooms)) {
    rooms[room] = data || { users: [], messages: [] }
    await saveRoomsDB(rooms)
    return rooms[room]
  }

  return null
}

export async function saveRoom(room: string, data: RoomItem) {
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
 * Tokens Use Cases
*/
export async function getTokensDB() {
  return getDB<TokensDB>(StorageItemKey.TOKENS)
}

export async function saveTokensDB(data: TokensDB) {
  return setDB(StorageItemKey.TOKENS, data)
}

export async function createTokensDB() {
  return createDB(StorageItemKey.TOKENS)
}

export async function getUserTokens(user: string) {
  const tokens = await getTokensDB()

  if (tokens && tokens[user]) {
    return tokens[user]
  }

  return null
}

export async function saveUserTokens(user: string, data: TokensByUser) {
  const tokens = await getTokensDB()

  if (tokens) {
    tokens[user] = data
    await saveTokensDB(tokens)
    return tokens[user]
  }

  return null
}