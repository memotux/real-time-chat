import { Room } from "~~/types";

export default defineWebSocketHandler({
  async upgrade(request) {
    await requireUserSession(request)
  },
  async open(peer) {
    const { user: { room } } = await getUserSession(peer) as { user: Room }

    const savedRoom = await getRoom(room)

    if (!savedRoom)
      throw createError({
        statusCode: 500,
        statusMessage: 'Error getting room.'
      })

    if (savedRoom && savedRoom.messages.length > 0) {
      // send messages history
      peer.send({ history: savedRoom.messages })
    }

    peer.subscribe(room)
    peer.send({ server: `Room "${room}" open.` })

    // console.log("[ws] open", peer);
  },

  async message(peer, message) {
    // console.log("[ws] message", peer, message);

    const { user: { room, user } } = await getUserSession(peer) as { user: Room }

    const savedRoom = await getRoom(room)

    if (!savedRoom) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Error getting room.'
      })
    }

    const newMessage = {
      message: message.text(),
      user,
      id: crypto.randomUUID()
    }

    savedRoom.messages.push(newMessage)
    peer.publish(room, { data: newMessage })
    peer.send({ data: newMessage })

    try {
      const updatedRoom = await saveRoom(room, savedRoom)

      if (!updatedRoom)
        throw createError({
          statusCode: 500,
          statusMessage: 'Error saving room.'
        })
    } catch (error) {
      console.error(error);
    }
  },

  async close(peer, event) {
    const { user: { user, room } } = await getUserSession(peer) as { user: Room }

    peer.unsubscribe(room)
    clearTokens(user)
    // console.log("[ws] close", peer, event);
    console.log("[ws] close", event);
  },

  error(peer, error) {
    console.error("[ws] error", peer, error);

    peer.send({ error: error.message })
  },
});

