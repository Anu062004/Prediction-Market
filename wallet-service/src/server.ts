import Fastify from 'fastify'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://user:pass@db:5432/pmarket' })

const app = Fastify({ logger: true })

app.post('/deposit-credit', async (req, reply) => {
  const { userId, amount, onchain_tx } = req.body as any
  await pool.query('UPDATE balances SET amount_hot = amount_hot + $1 WHERE user_id=$2 AND currency=$3', [amount, userId, 'PRED'])
  await pool.query('INSERT INTO transactions(user_id, type, amount, status, onchain_tx) VALUES ($1,$2,$3,$4,$5)', [userId, 'deposit', amount, 'confirmed', onchain_tx])
  return reply.send({ ok: true })
})

app.post('/withdraw-request', async (req, reply) => {
  const { userId, amount, address } = req.body as any
  const kyc = await pool.query('SELECT kyc_status FROM users WHERE id=$1', [userId])
  if ((kyc.rows[0]?.kyc_status || 'unverified') !== 'verified' && Number(amount) > 100) {
    return reply.code(400).send({ error: 'KYC required' })
  }
  await pool.query('UPDATE balances SET amount_hot = amount_hot - $1 WHERE user_id=$2 AND currency=$3', [amount, userId, 'PRED'])
  await pool.query('INSERT INTO withdraw_requests(user_id, amount, address, status) VALUES ($1,$2,$3,$4)', [userId, amount, address, 'queued'])
  return reply.send({ status: 'queued' })
})

const port = Number(process.env.WALLET_PORT || 3010)
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err)
  process.exit(1)
})
