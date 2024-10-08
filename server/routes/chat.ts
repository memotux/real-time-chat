export default defineWebSocketHandler({
  async open(peer) {

    const { room } = await decodeToken(peer.ctx)

    const rooms = await getRoomsDB()

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

    const { room, user } = await decodeToken(peer.ctx)

    const rooms = await getRoomsDB()

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
      await saveRoomsDB(JSON.stringify(rooms))
    } else {
      throw createError({
        statusCode: 403,
        statusMessage: 'Room not exist.'
      })
    }
  },

  async close(peer, event) {
    const { room } = await decodeToken(peer.ctx)
    peer.unsubscribe(room)
    console.log("[ws] close", peer, event);
  },

  error(peer, error) {
    console.error("[ws] error", peer, error);

    peer.send({ error: error.message })
  },
});

