import type { RoomItem, RoomsDB, TokensByUser, TokensDB } from "@/types";
import { getDB, setDB, createDB } from "./adapters";

/**
 * Rooms Use Cases
*/

export async function getRoomsDB() {
  return getDB<RoomsDB>('rooms.json')
}

export async function saveRoomsDB(data: RoomsDB) {
  await setDB('rooms.json', data)
}

export async function createRoomsDB() {
  await createDB('rooms.json')
}

export async function getRoom(room: string) {
  const rooms = await existRoom(room)
  if (rooms) {
    return rooms[room]
  }
}

export async function existRoom(room: string) {
  const rooms = await getRoomsDB()
  if (rooms && room in rooms) {
    return rooms
  }
}

export async function createRoom(room: string, data?: RoomItem) {
  const rooms = await getRoomsDB()

  if (rooms && !(room in rooms)) {
    rooms[room] = data || { users: [], messages: [] }
    await saveRoomsDB(rooms)
    return rooms[room]
  }
}

export async function saveRoom(room: string, data: RoomItem) {
  const rooms = await existRoom(room)

  if (rooms) {
    rooms[room] = data
    await saveRoomsDB(rooms)
  }
}

/**
 * Tokens Use Cases
*/
export async function getTokensDB() {
  return getDB<TokensDB>('tokens.json')
}

export async function saveTokensDB(data: TokensDB) {
  await setDB('tokens.json', data)
}

export async function createTokensDB() {
  await createDB('tokens.json')
}

export async function getUserTokens(user: string) {
  const tokens = await getTokensDB()

  if (tokens && user in tokens) {
    return tokens[user]
  }

  return null
}

export async function saveUserTokens(user: string, data: TokensByUser) {
  const tokens = await getTokensDB()

  if (tokens) {
    tokens[user] = data
    await saveTokensDB(tokens)
  }
}