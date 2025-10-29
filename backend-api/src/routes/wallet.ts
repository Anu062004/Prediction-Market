import { FastifyInstance } from 'fastify'
import { query } from '../db'

export default async function walletRoutes(app: FastifyInstance) {
  app.get('/api/wallet/:userId/balance', { preHandler: app.auth }, async (req, reply) => {
    const { userId } = req.params as any
    const r = await query('SELECT amount_hot, amount_cold FROM balances WHERE user_id=$1 AND currency=$2', [userId, 'PRED'])
    return reply.send(r.rows[0] || { amount_hot: 0, amount_cold: 0 })
  })

  app.post('/api/wallet/:userId/withdraw', { preHandler: app.auth }, async (req, reply) => {
    const { userId } = req.params as any
    const { amount, address } = (req.body as any)
    const kyc = await query('SELECT kyc_status FROM users WHERE id=$1', [userId])
    if ((kyc.rows[0]?.kyc_status || 'unverified') !== 'verified' && Number(amount) > 100) {
      return reply.code(400).send({ error: 'KYC required for this amount' })
    }
    await query('INSERT INTO withdraw_requests(user_id, amount, address, status) VALUES ($1,$2,$3,$4)', [userId, amount, address, 'queued'])
    return reply.send({ status: 'queued' })
  })

  app.post('/webhook/linera/deposit-notify', async (req, reply) => {
    const { toAddress, amount, userId } = (req.body as any)
    // credit to hot balance
    await query('UPDATE balances SET amount_hot = amount_hot + $1 WHERE user_id=$2 AND currency=$3', [amount, userId, 'PRED'])
    await query('INSERT INTO transactions(user_id, type, amount, status, onchain_tx) VALUES ($1,$2,$3,$4,$5)', [userId, 'deposit', amount, 'confirmed', 'tx'])
    return reply.send({ ok: true })
  })
}
