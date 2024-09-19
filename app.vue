<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  message: z.string(),
})

type FormSchema = z.output<typeof schema>

interface FormUI {
  connected: boolean
  chat: Array<string>
}

const formState = reactive<FormSchema>({
  message: '',
})
const formUi = reactive<FormUI>({
  connected: false,
  chat: [],
})
let socket: WebSocket

const activeUser = useCookie('tuxchat')
activeUser.value = 'memotux'

onMounted(() => {
  socket = new WebSocket('ws://localhost:3000/chat')

  socket.onopen = socketOnOpen
  socket.onmessage = socketOnMessage
})

onUnmounted(() => {
  socket.close()
})

function onSubmit(event: FormSubmitEvent<FormSchema>) {
  socket.send(event.data.message)
  formState.message = ''
}

function socketOnOpen() {
  formUi.connected = true
}
function socketOnMessage(event: MessageEvent<string>) {
  formUi.chat.push(event.data)
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
        class="w-full h-[90%] overflow-y-scroll"
      >
        <li
          v-for="message in formUi.chat"
          :key="message"
        >
          {{ message }}
        </li>
      </UContainer>
      <UDivider />
      <UForm
        :schema="schema"
        :state="formState"
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
            v-model="formState.message"
            placeholder="Type a message..."
          />
        </UFormGroup>
        <UButton
          type="submit"
          :disable="!formUi.connected"
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
