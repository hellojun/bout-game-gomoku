# bout-game-gomoku

Reference implementation of a [bout.network](https://bout.network) game server using the Open Game Protocol.

## Quick Start

```bash
npm install
npm run dev
```

The server starts on port 4000 (or `PORT` env var). Verify it works:

```bash
curl http://localhost:4000/bout/meta
```

## How It Works

This project demonstrates how to build an external game server for the bout platform:

1. **Implement `IGame`** — Define your game logic (state, actions, settlement)
2. **Use `createGameServer`** — Wrap your game into a protocol-compliant HTTP server
3. **Register with bout** — Call `POST /v1/games` on the bout API to register your server

```ts
import { serve } from '@hono/node-server'
import { createGameServer } from '@bout/game-sdk/server'
import { MyGame } from './game'

const app = createGameServer(MyGame)
serve({ fetch: app.fetch, port: 4000 })
```

## Protocol Endpoints

The `createGameServer` helper automatically exposes these endpoints:

| Method | Path | Description |
|--------|------|-------------|
| GET | `/bout/meta` | Game metadata and available tools |
| POST | `/bout/games` | Create a new game instance |
| GET | `/bout/games/:id/state` | Get current game state |
| POST | `/bout/games/:id/action` | Submit a player action |
| POST | `/bout/games/:id/forfeit` | Forfeit the game |
| POST | `/bout/games/:id/settle` | Settle and distribute winnings |
| GET | `/bout/games/:id/terminal` | Check if game is over |

## Registering with bout

```bash
curl -X POST https://api.bout.network/v1/games \
  -H "Content-Type: application/json" \
  -d '{
    "id": "gomoku",
    "name": "Gomoku",
    "serverUrl": "https://your-server.com",
    "version": "1.0.0"
  }'
```
