export interface Message { message: string, id?: number }

export type MessagesItem = Record<string, Message[]>

export interface MessageData {
  server: string
  history: Message[]
  data: Message
  error: string
}
