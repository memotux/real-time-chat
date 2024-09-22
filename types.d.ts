export interface Message { message: string, user: string, id: string }

export interface RoomItem {
  users: string[]
  messages: Message[]
}

export type Rooms = Record<string, RoomItem>

export interface ChatData {
  server: string
  history: Message[]
  data: Message
  error: string
}
