import type { Rooms } from "@/types";
import { getRoomUser } from "../utils/chat";

export default defineWebSocketHandler({
  async open(peer) {
    const { room, user } = getRoomUser(peer.ctx, 'tuxchat')

    setCookie(peer.ctx, 'tuxchat', JSON.stringify({ room, user, auth: crypto.getRandomValues }))

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
    let rooms: Rooms | null = null
    try {
      rooms = await useStorage('db').getItem('rooms.json')
    } catch (error) {
      console.error(error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Unable to access DB'
      })
    }

    let updateDB = false

    if (rooms && !(room in rooms)) {
      // create room with empty array
      rooms[room] = { users: [], messages: [] }
      peer.send({ server: 'Room created.' })
      updateDB = true
    }
    if (rooms && !(user in rooms[room].users)) {
      rooms[room].users.push(user)
      peer.send({ server: 'User registered.' })
      updateDB = true
    }

    if (updateDB) {
      try {
        await useStorage('db')
          .setItem(
            'rooms.json',
            JSON.stringify({ ...rooms })
          )
      } catch (error) {
        console.log(error);
        throw createError({
          statusCode: 500,
          statusMessage: 'Error updating DB.'
        })
      }
    }

    if (rooms && rooms[room].messages.length > 0) {
      // send messages history
      peer.send({ history: rooms[room].messages })
    }

    peer.subscribe(room)
    peer.send({ server: `Room "${room}" open.` })

    console.log("[ws] open", peer);
  },

  async message(peer, message) {
    // console.log("[ws] message", peer, message);
    const { user, room } = getRoomUser(peer.ctx, 'tuxchat')

    let rooms: Rooms | null = null
    try {
      rooms = await useStorage('db').getItem('rooms.json')
    } catch (error) {
      console.error(error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Can not get Rooms.'
      })
    }

    if (!rooms) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Rooms not exist.'
      })
    }

    if (room in rooms) {
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
        statusMessage: 'Room not exist.'
      })
    }
  },

  close(peer, event) {
    const { room } = getRoomUser(peer.ctx, 'tuxchat')

    // setCookie(peer.ctx, 'tuxchat', JSON.stringify(null))
    peer.unsubscribe(room)
    console.log("[ws] close", peer, event);
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);

    peer.send({ error: error.message })
  },
});

