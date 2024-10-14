import type { ChatData } from "@@/types"

export const useSocket = () => {
  const socket: WebSocket = new WebSocket('ws://localhost:3000/chat')
  const chat = useChat()
  const toast = useToast()

  socket.onopen = () => {
    chat.value.connected = true
  }
  socket.onmessage = (event: MessageEvent<string>) => {
    const { data, server, history, error } = JSON.parse(event.data) as ChatData
    if (history) {
      chat.value.messages = structuredClone(history)
      return
    }

    if (server) {
      toast.add({ title: server })
      return
    }

    if (error) {
      toast.add({ title: error, color: 'red' })
      return
    }

    if (data) {
      chat.value.messages.push(data)
    }
  }
  socket.onclose = () => {
    chat.value.connected = false
  }
  socket.onerror = (event) => {
    console.error(event)
  }
  return socket
}