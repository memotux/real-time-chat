import { RoomsDB, TokensDB } from "@/types";
import { getDB, setDB, createDB } from "./adapters";

export async function getRoomsDB() {
  return getDB<RoomsDB>('rooms.json')
}
export async function saveRoomsDB(data: string) {
  await setDB('rooms.json', data)
}
export async function createRoomsDB() {
  await createDB('rooms.json')
}

export async function getTokensDB() {
  return getDB<TokensDB>('tokens.json')
}
export async function saveTokensDB(data: string) {
  await setDB('tokens.json', data)
}
export async function createTokensDB() {
  await createDB('tokens.json')
}