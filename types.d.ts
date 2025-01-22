export interface Message { message: string, user: string, id: string }

type StorageValue = null | string | number | boolean | object;

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

export interface RoomsDB extends StorageValue {
  [key: string]: RoomItem
}
export interface TokensDB extends StorageValue {
  [key: string]: TokensByUser
}

declare module '#auth-utils' {
  interface User extends Room {
    // Add your own fields
  }

  // interface UserSession {
  //   // Add your own fields
  // }

  // interface SecureSessionData {
  //   // Add your own fields
  // }
}