# Nuxt 3 Real Time Chat

Inspired by [@midudev Chat en tiempo real](https://youtu.be/WpbBhTx5R9Q)

> [!CAUTION]
> This is not a production ready project. Use it on your own risk.

## Features

- Use Nitro/h3 WebSocket API in server
- Browser WebSocket API with `@vueuse/useWebSocket`
- Clean Architecture with Nuxt Layers:
  - Storage:
    - Use Nuxt/Nitro Storage 'fs' to save rooms and messages.
    - Create, Update, Save Chat Rooms.
  - Auth:
    - Auth with `nuxt-auth-utils`.
    - Use `local` OAuth handler, just for development.

## Setup

Make sure to install the dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```
