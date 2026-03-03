import { serve } from '@hono/node-server'
import { createGameServer } from '@boutnetwork/game-sdk/server'
import { Gomoku } from './game.js'

const app = createGameServer(Gomoku)
const port = Number(process.env.PORT || 4000)

serve({ fetch: app.fetch, port })
console.log(`Gomoku game server running on http://localhost:${port}`)
