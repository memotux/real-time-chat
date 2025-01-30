<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'
import type { ChatData } from '@@/types'

const schema = z.object({
  message: z.string(),
})

type FormSchema = z.output<typeof schema>

const state = reactive<FormSchema>({
  message: '',
})

const chat = useChat()
const toast = useToast()
const { user, clear } = useUserSession()

const { send, open, close } = useWebSocket('ws://localhost:3000/chat', {
  immediate: false,
  autoConnect: false,
  onConnected() {
    chat.value.connected = true
  },
  async onMessage(_, event) {
    const message = await event.data.text()
    const { data, server, history, error } = JSON.parse(message) as ChatData
    if (history) {
      chat.value.messages = structuredClone(history)
      return
    }

    if (server) {
      toast.add({ title: server })
      return
    }

    if (error) {
      toast.add({ title: error, color: 'red' })
      return
    }

    if (data) {
      chat.value.messages.push(data)
    }
  },
  onDisconnected() {
    chat.value.connected = false
  },
  onError(_, event) {
    console.error(event)
  },
})

const onLogout = () => {
  close()
  chat.value.messages = []
  clear()
}

function onSubmit(event: FormSubmitEvent<FormSchema>) {
  send(event.data.message)
  state.message = ''
}

onMounted(() => {
  open()
})
</script>

<template>
  <UContainer class="flex justify-around items-center w-full">
    <p>Room: {{ user?.user || 'Anonymous' }}</p>
    <p>User: {{ user?.room || 'anonymous' }}</p>
    <UButton @click="onLogout">Logout</UButton>
  </UContainer>
  <UDivider />
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col space-y-2 items-end w-full"
    @submit.prevent="onSubmit"
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
</template>
