import Fastify from 'fastify'
import pg from 'pg'
import dotenv from 'dotenv'
import { tokenTransfer } from './linera'

dotenv.config()

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgres://user:pass@db:5432/pmarket' })

const app = Fastify({ logger: true })

app.get('/health', async (_req, reply) => {
  return reply.send({ ok: true, linera: {
    node: !!process.env.LINERA_NODE_URL,
    wallet: !!process.env.LINERA_WALLET,
    chain: !!process.env.LINERA_CHAIN_ID,
    tokenApp: !!process.env.TOKEN_APP_ID
  }})
})

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
  // debit hot balance
  await pool.query('UPDATE balances SET amount_hot = amount_hot - $1 WHERE user_id=$2 AND currency=$3', [amount, userId, 'PRED'])
  // on-chain transfer via Linera
  try {
    const res = await tokenTransfer(address, String(amount))
    await pool.query('INSERT INTO withdraw_requests(user_id, amount, address, status) VALUES ($1,$2,$3,$4)', [userId, amount, address, 'sent'])
    await pool.query('INSERT INTO transactions(user_id, type, amount, status, onchain_tx) VALUES ($1,$2,$3,$4,$5)', [userId, 'withdraw', amount, 'sent', res.slice(0, 120)])
    return reply.send({ status: 'sent' })
  } catch (e: any) {
    app.log.error(e)
    await pool.query('INSERT INTO withdraw_requests(user_id, amount, address, status) VALUES ($1,$2,$3,$4)', [userId, amount, address, 'failed'])
    return reply.code(500).send({ error: 'Linera transfer failed', detail: e.message })
  }
})

const port = Number(process.env.WALLET_PORT || 3010)
app.listen({ port, host: '0.0.0.0' }).catch((err) => {
  app.log.error(err)
  process.exit(1)
})
