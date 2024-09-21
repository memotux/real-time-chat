import type { MessagesItem } from "@/types";

const CHAT_ID = 'TUX:chat'

export default defineWebSocketHandler({
  async open(peer) {
    const user = getCookie(peer.ctx, 'tuxchat')

    if (user === 'anonymous') {
      console.log('user is ', user);

      throw createError({
        statusMessage: "User not valid",
        statusCode: 400
      });
    }

    if (!user) {
      peer.send({ server: 'Please add a name, and send "Subscribe" to init chat.' })
      return
    }

    try {
      if (!await useStorage('db').hasItem('messages.json')) {
        console.log('creating db file');

        await useStorage('db').setItem('messages.json', JSON.stringify({}))
      }
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to create DB'
      })
    }

    try {
      const messages = await useStorage('db').getItem<MessagesItem>('messages.json')

      if (messages && !messages[user]) {
        // create user with empty array
        await useStorage('db')
          .setItem(
            'messages.json',
            JSON.stringify({ ...messages, [user]: [] })
          )
        messages[user] = []
      }

      if (messages && messages[user].length > 0) {
        // send messages history
        const messagesWithId = messages[user].map((m, i) => ({ ...m, id: i }))
        peer.send({ history: messagesWithId })
      }

      peer.subscribe(CHAT_ID)
      peer.send({ server: 'Subscribed to ' + CHAT_ID })
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to access DB'
      })
    }

    console.log("[ws] open", peer);
  },

  async message(peer, message) {
    // console.log("[ws] message", peer, message);
    const activeUser = getCookie(peer.ctx, 'tuxchat') || 'anonymus'
    if (message.text().toLocaleLowerCase() === 'subscribe') {
      const messages = await useStorage('db').getItem<MessagesItem>('messages.json')
      if (!messages) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Something went wrong with database.'
        })
      }
      if (messages && messages[activeUser]?.length > 0) {
        console.log(activeUser);

        peer.send({ server: 'User already subscribed.' })
        return
      }
      await useStorage('db')
        .setItem(
          'messages.json',
          JSON.stringify({ ...messages, [activeUser]: [] })
        )

      peer.send({ server: 'User successfuly registered.' })
      return
    }
    try {

      const messages = await useStorage<MessagesItem>('db').getItem('messages.json') ?? { anonymous: [] }

      if (Object.keys(messages).includes(activeUser)) {
        const id = messages[activeUser].push({
          message: message.text()
        })
        peer.publish(CHAT_ID, { data: { message: message.text(), id } })
        peer.send({ data: { message: message.text(), id } })
        await useStorage('db').setItem('messages.json', JSON.stringify(messages))
      } else {
        throw createError({
          statusCode: 403,
          statusMessage: 'User not registered'
        })
      }
    } catch (error) {
      console.error(error);
    }
  },

  close(peer, event) {
    console.log("[ws] close", peer, event);
    peer.unsubscribe(CHAT_ID)
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);
    peer.send({ error: error.message })
  },
});

