<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const schema = z.object({
  message: z.string(),
})

type Schema = z.output<typeof schema>

const state = reactive({
  message: undefined,
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // Do something with data
  console.log(event.data)
}
</script>

<template>
  <UContainer class="flex flex-col space-y-8 h-full">
    <h1 class="text-4xl text-primary">Tux Chat</h1>
    <UContainer
      id="chat"
      class="border border-primary rounded-lg p-8 h-full w-1/2"
    >
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormGroup
          label="Message"
          name="message"
          required
        >
          <UInput
            v-model="state.message"
            placeholder="Type a message..."
          />
        </UFormGroup>
        <UButton type="submit"> Submit </UButton>
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
