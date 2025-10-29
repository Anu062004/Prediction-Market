import Fastify from 'fastify'
import { randomBytes, createHash } from 'node:crypto'
import { v4 as uuidv4 } from 'uuid'

const app = Fastify({ logger: true })

const rounds = new Map<string, { serverSeed: string, serverSeedHash: string, nonce: number, game: string }>()

app.post('/internal/start', async (req, reply) => {
  const { game } = req.body as any
  const serverSeed = randomBytes(32).toString('hex')
  const serverSeedHash = createHash('sha256').update(serverSeed).digest('hex')
  const id = uuidv4()
  rounds.set(id, { serverSeed, serverSeedHash, nonce: 0, game })
  return reply.send({ roundId: id, serverSeedHash, nonce: 0 })
})

app.post('/internal/resolve', async (req, reply) => {
  const { roundId } = req.body as any
  const r = rounds.get(roundId)
  if (!r) return reply.code(404).send({ error: 'not found' })
  return reply.send({ roundId, serverSeed: r.serverSeed })
})

const port = Number(process.env.GAME_PORT || 3020)
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err)
  process.exit(1)
})
