import type { MessagesItem } from "@/types";

const CHAT_ID = 'TUX:chat'

export default defineWebSocketHandler({
  async open(peer) {
    console.log("[ws] open", peer);

    const user = getCookie(peer.ctx, 'tuxchat') || 'anonymous'

    if (user === 'anonymous') {
      throw new Error("User not valid");
    }

    if (!await useStorage('db').hasItem('messages.json')) {
      useStorage('db').setItem('messages.json', JSON.stringify({}))
    }

    const messages = await useStorage('db').getItem<MessagesItem>('messages.json')

    if (messages && !messages[user]) {
      // create user with empty array
      await useStorage('db')
        .setItem(
          'messages.json',
          JSON.stringify({ ...messages, [user]: [] })
        )
    }

    if (messages && Object.keys(messages).includes(user) && messages[user].length > 0) {
      // send messages history
      const messagesWithId = messages[user].map((m, i) => ({ ...m, id: i }))
      peer.send({ history: messagesWithId })
    }

    peer.subscribe(CHAT_ID)
    peer.send({ server: 'Subscribed to ' + CHAT_ID })
  },

  async message(peer, message) {
    // console.log("[ws] message", peer, message);
    try {
      const activeUser = getCookie(peer.ctx, 'tuxchat') || 'anonymus'
      const messages = await useStorage<MessagesItem>('db').getItem('messages.json') ?? { anonymous: [] }

      if (Object.keys(messages).includes(activeUser)) {
        messages[activeUser].push({
          message: message.text()
        })
        const id = messages[activeUser].length - 1
        useStorage('db').setItem('messages.json', JSON.stringify(messages))
        peer.publish(CHAT_ID, { message: message.text(), id })
        peer.send({ message: message.text(), id })
      }
    } catch (error) {
      console.error(error);
      throw new Error("User not registered");
    }
  },

  close(peer, event) {
    console.log("[ws] close", peer, event);
    peer.unsubscribe(CHAT_ID)
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);
    peer.send(error.message)
  },
});

