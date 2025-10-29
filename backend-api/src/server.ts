import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import auth from './auth'
import gamesRoutes from './routes/games'
import walletRoutes from './routes/wallet'
import dotenv from 'dotenv'

dotenv.config()

const app = Fastify({ logger: true })

app.register(websocket)
app.register(auth)
app.register(async (instance) => {
  await gamesRoutes(instance)
  await walletRoutes(instance)
})

app.get('/ws/games', { websocket: true }, (connection) => {
  connection.socket.send(JSON.stringify({ type: 'hello', ts: Date.now() }))
})

const port = Number(process.env.PORT || 3000)
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err)
  process.exit(1)
})
