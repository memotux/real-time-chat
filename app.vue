<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { MessageData } from '@/types'

const schema = z.object({
  message: z.string(),
})

type FormSchema = z.output<typeof schema>

interface Chat {
  connected: boolean
  messages: Array<{ message?: string; id?: number }>
}

const toast = useToast()

const formState = reactive<FormSchema>({
  message: '',
})
const chat = reactive<Chat>({
  connected: false,
  messages: [],
})
let socket: WebSocket

const activeUser = useCookie('tuxchat')

onMounted(() => {
  socket = new WebSocket('ws://localhost:3000/chat')
  socket.onopen = socketOnOpen
  socket.onmessage = socketOnMessage
  socket.onclose = () => {
    chat.connected = false
  }
  socket.onerror = (event) => {
    console.error(event)
  }
})

onUnmounted(() => {
  socket.close()
})

function onSubmit(event: FormSubmitEvent<FormSchema>) {
  socket.send(event.data.message)
  formState.message = ''
}

function socketOnOpen() {
  chat.connected = true
}
function socketOnMessage(event: MessageEvent<string>) {
  const { message, server, history } = JSON.parse(event.data) as MessageData
  if (server) {
    toast.add({ title: server })
  }

  if (message) {
    chat.messages.push(message)
  }

  if (history) {
    chat.messages = structuredClone(history)
  }
}
</script>

<template>
  <UContainer class="flex flex-col space-y-8 h-full">
    <h1 class="text-4xl text-primary text-center">Tux Chat</h1>
    <UContainer
      id="chat"
      class="flex flex-col border border-primary rounded-lg p-8 h-full w-1/2 justify-between"
    >
      <UContainer
        as="ul"
        class="w-full h-[75%] overflow-y-scroll"
      >
        <li
          v-for="item in chat.messages"
          :key="item.id"
        >
          {{ item.message }}
        </li>
      </UContainer>
      <UDivider />
      <UForm
        :schema="schema"
        :state="formState"
        class="flex flex-col space-y-2 items-end w-full"
        @submit="onSubmit"
      >
        <UFormGroup
          label="Message"
          name="message"
          class="w-full"
          required
        >
          <UInput
            v-model="formState.message"
            placeholder="Type a message..."
            :disabled="!chat.connected"
          />
        </UFormGroup>
        <UFormGroup
          label="Name"
          name="name"
          class="w-full"
          required
        >
          <UInput
            v-model="activeUser"
            placeholder="Your name here..."
            :disabled="!chat.connected"
          />
        </UFormGroup>
        <UButton
          type="submit"
          :disabled="!chat.connected"
        >
          Submit
        </UButton>
      </UForm>
    </UContainer>
  </UContainer>
  <UNotifications />
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

#chat ul {
  li {
    border-radius: 0.375rem;
    padding: 0.5rem;
  }
  li:nth-child(even) {
    --tw-bg-opacity: 0.35;
    background-color: rgb(30 41 59 / var(--tw-bg-opacity));
  }
}
</style>
