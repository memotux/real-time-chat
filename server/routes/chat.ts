const CHAT_ID = 'TUX:chat'

export default defineWebSocketHandler({
  open(peer) {
    console.log("[ws] open", peer);
    peer.subscribe(CHAT_ID)
  },

  message(peer, message) {
    console.log("[ws] message", peer, message);
    if (message.text().includes("ping")) {
      peer.send("pong");
    }
    peer.publish(CHAT_ID, message.text())
    peer.send(message.text())
  },

  close(peer, event) {
    console.log("[ws] close", peer, event);
    peer.unsubscribe(CHAT_ID)
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);
  },
});

