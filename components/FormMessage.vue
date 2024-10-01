<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  message: z.string(),
})

type FormSchema = z.output<typeof schema>

const state = reactive<FormSchema>({
  message: '',
})

const { signOut, data } = useAuth()
const socket = useSocket()
const chat = useChat()

const onLogout = () => {
  socket.close()
  chat.value.messages = []
  signOut({ redirect: false })
}

function onSubmit(event: FormSubmitEvent<FormSchema>) {
  // socket.send(event.data.message)
  state.message = ''
}

onUnmounted(() => socket.close())
</script>

<template>
  <UContainer class="flex justify-around items-center w-full">
    <p>Room: {{ data?.room || 'Anonymous' }}</p>
    <p>User: {{ data?.user || 'anonymous' }}</p>
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
