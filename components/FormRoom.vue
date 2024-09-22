<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  user: z.string(),
  room: z.string(),
})

type FormSchema = z.output<typeof schema>

const state = reactive<FormSchema>({
  user: '',
  room: '',
})

const activeRoom = useCookie('tuxchat')

function onSubmit(event: FormSubmitEvent<FormSchema>) {
  activeRoom.value = JSON.stringify({ ...event.data })
  state.user = ''
  state.room = ''
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="flex flex-col space-y-2 items-end w-full"
    @submit="onSubmit"
  >
    <UFormGroup
      label="Name"
      name="name"
      class="w-full"
      required
    >
      <UInput
        v-model="state.user"
        placeholder="Your name..."
      />
    </UFormGroup>
    <UFormGroup
      label="Room"
      name="room"
      class="w-full"
      required
    >
      <UInput
        v-model="state.room"
        placeholder="Name of room you want to open..."
      />
    </UFormGroup>
    <UButton type="submit"> Open Room </UButton>
  </UForm>
</template>
