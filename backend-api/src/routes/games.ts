import { FastifyInstance } from 'fastify'
import { randomSeed, hashSeed } from '../utils/provablyFair'
import { query } from '../db'
import { v4 as uuidv4 } from 'uuid'

export default async function gamesRoutes(app: FastifyInstance) {
  app.post('/api/games/:game/rounds', { preHandler: app.auth }, async (req, reply) => {
    const game = (req.params as any).game
    const roundId = uuidv4()
    const serverSeed = randomSeed()
    const serverSeedHash = hashSeed(serverSeed)
    const startAt = new Date()
    const nonce = 0

    await query('INSERT INTO rounds(id, game, server_seed_hash, server_seed, nonce, status, start_at) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [roundId, game, serverSeedHash, serverSeed, nonce, 'started', startAt])

    // broadcast
    app.websocketServer?.clients.forEach((c: any) => {
      try { c.send(JSON.stringify({ type: 'round_started', game, roundId, serverSeedHash, startAt })) } catch {}
    })

    return reply.send({ roundId, serverSeedHash, nonce, startAt })
  })

  app.post('/api/games/:game/rounds/:roundId/bet', { preHandler: app.auth }, async (req, reply) => {
    const { game, roundId } = req.params as any
    const { userId, amount, choice } = (req.body as any)

    // check balance
    const bal = await query<{ amount_hot: string }>('SELECT amount_hot FROM balances WHERE user_id=$1 AND currency=$2', [userId, 'PRED'])
    const hot = Number(bal.rows[0]?.amount_hot || 0)
    if (hot < Number(amount)) {
      return reply.code(400).send({ error: 'Insufficient balance' })
    }

    const betId = uuidv4()
    await query('INSERT INTO bets(id, round_id, user_id, amount, choice, status) VALUES ($1,$2,$3,$4,$5,$6)',
      [betId, roundId, userId, amount, choice, 'placed'])
    await query('UPDATE balances SET amount_hot = amount_hot - $1 WHERE user_id=$2 AND currency=$3', [amount, userId, 'PRED'])

    app.websocketServer?.clients.forEach((c: any) => {
      try { c.send(JSON.stringify({ type: 'bet_placed', game, roundId, betId, userId, amount, choice })) } catch {}
    })

    return reply.send({ betId })
  })

  app.post('/api/games/:game/rounds/:roundId/resolve', async (req, reply) => {
    const { game, roundId } = req.params as any
    // in real flow only game-service/admin triggers this via signed request; skip for scaffold
    const round = await query<any>('SELECT server_seed FROM rounds WHERE id=$1', [roundId])
    if (!round.rows[0]) return reply.code(404).send({ error: 'Round not found' })

    const serverSeed = round.rows[0].server_seed as string
    const result = Math.random() // placeholder outcome

    await query('UPDATE rounds SET status=$1, result=$2, resolve_at=now() WHERE id=$3', ['resolved', result, roundId])

    app.websocketServer?.clients.forEach((c: any) => {
      try { c.send(JSON.stringify({ type: 'round_resolved', game, roundId, serverSeed, result })) } catch {}
    })

    return reply.send({ serverSeed, result })
  })
}
