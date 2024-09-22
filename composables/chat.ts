import type { Message } from "~/types"

interface Chat {
  connected: boolean
  messages: Array<Message>
}

export const useChat = () => useState<Chat>('chat', () => ({
  connected: false,
  messages: [],
}))
