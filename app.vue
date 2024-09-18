<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  message: z.string(),
})

type Schema = z.output<typeof schema>

interface State extends Schema {
  connected: boolean
  chat: Array<string>
}

const state = reactive<State>({
  message: '',
  connected: false,
  chat: [],
})
let socket: WebSocket

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data)
  socket.send(event.data.message)
  state.message = ''
}

onMounted(() => {
  // Create WebSocket connection.
  socket = new WebSocket('ws://localhost:3000/chat')

  // Connection opened
  socket.addEventListener('open', socketOnOpen)

  // Listen for messages
  socket.addEventListener('message', socketOnMessage)
})

onUnmounted(() => {
  socket.removeEventListener('open', socketOnOpen)
  socket.removeEventListener('message', socketOnMessage)
  socket.close()
})

function socketOnOpen() {
  state.connected = true
}
function socketOnMessage(event: MessageEvent<string>) {
  state.chat.push(event.data)
}
</script>

<template>
  <UContainer class="flex flex-col space-y-8 h-full">
    <h1 class="text-4xl text-primary">Tux Chat</h1>
    <UContainer
      id="chat"
      class="border border-primary rounded-lg p-8 h-full w-1/2 flex flex-col justify-between"
    >
      <UContainer class="w-full">
        <pre>{{ state.chat }}</pre>
      </UContainer>
      <UForm
        :schema="schema"
        :state="state"
        class="flex space-x-4 items-end w-full"
        @submit="onSubmit"
      >
        <UFormGroup
          label="Message"
          name="message"
          class="w-full"
          required
        >
          <UInput
            v-model="state.message"
            placeholder="Type a message..."
          />
        </UFormGroup>
        <UButton
          type="submit"
          :disable="!state.connected"
        >
          Submit
        </UButton>
      </UForm>
    </UContainer>
  </UContainer>
</template>

<style>
body {
  width: 100dvw;
  height: 100dvh;
}
#__nuxt {
  width: 100%;
  height: 100%;
}
</style>
