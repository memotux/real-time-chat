export interface Message { message: string, user: string, id: string }

export interface RoomItem {
  users: string[]
  messages: Message[]
}

export interface ChatData {
  server: string
  history: Message[]
  data: Message
  error: string
}

export interface Room {
  user: string
  room: string
}

export interface TokensByUser {
  access: Record<string, string>
  refresh: Record<string, string>
}

export type RoomsDB = Record<string, RoomItem>
export type TokensDB = Record<string, TokensByUser>