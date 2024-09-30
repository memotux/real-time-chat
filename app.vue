<script setup lang="ts">
const chat = useChat()
const { status } = useAuth()
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
      <FormMessage v-if="status === 'authenticated'" />
      <FormRoom v-else />
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
