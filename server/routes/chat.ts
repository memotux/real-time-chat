import type { Rooms } from "@/types";

export default defineWebSocketHandler({
  async open(peer) {
    const cookie = getCookie(peer.ctx, 'tuxchat') || '{"user": null, "room": null}'

    const { user, room } = JSON.parse(cookie)

    if (!user || !room) {
      throw createError({
        statusMessage: "User or Room not valid",
        statusCode: 400
      });
    }

    try {
      if (!await useStorage('db').hasItem('rooms.json')) {
        console.log('creating db file');

        await useStorage('db').setItem('rooms.json', JSON.stringify({}))
      }
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to create DB'
      })
    }

    try {
      const rooms = await useStorage('db').getItem<Rooms>('rooms.json')

      if (rooms && !rooms[room]) {
        // create room with empty array
        rooms[room] = { users: [], messages: [] }
        peer.send({ server: 'Room created.' })
      }
      if (rooms && !rooms[room].users.includes(user)) {
        rooms[room].users.push(user)
        peer.send({ server: 'User registered.' })
      }

      await useStorage('db')
        .setItem(
          'rooms.json',
          JSON.stringify({ ...rooms })
        )

      if (rooms && rooms[room].messages.length > 0) {
        // send messages history
        peer.send({ history: rooms[room].messages })
      }

      peer.subscribe(room)
      peer.send({ server: `Room ${room} open.` })
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
    const cookie = getCookie(peer.ctx, 'tuxchat') || '{"user": null, "room": null}'
    const { user, room } = JSON.parse(cookie)

    if (!user || !room) {
      throw createError({
        statusMessage: "User or Room not valid",
        statusCode: 400
      });
    }

    try {
      const rooms = await useStorage<Rooms>('db').getItem('rooms.json')

      if (!rooms) {
        throw createError({
          statusCode: 500,
          statusMessage: 'Unable to get Rooms'
        })
      }

      if (Object.keys(rooms).includes(room)) {
        const newMessage = {
          message: message.text(),
          user,
          id: crypto.randomUUID()
        }
        rooms[room].messages.push(newMessage)
        peer.publish(room, { data: newMessage })
        peer.send({ data: newMessage })
        await useStorage('db').setItem('rooms.json', JSON.stringify(rooms))
      } else {
        throw createError({
          statusCode: 403,
          statusMessage: 'Room not open.'
        })
      }
    } catch (error) {
      console.error(error);
    }
  },

  close(peer, event) {
    const cookie = getCookie(peer.ctx, 'tuxchat') || '{"user": null, "room": null}'
    const { room } = JSON.parse(cookie)
    setCookie(peer.ctx, 'tuxchat', JSON.stringify(null))
    peer.unsubscribe(room)
    console.log("[ws] close", peer, event);
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);

    peer.send({ error: error.message })
  },
});

