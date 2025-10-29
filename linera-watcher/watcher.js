#!/usr/bin/env node
import axios from 'axios'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv))
  .option('rpc', { type: 'string', demandOption: false, default: 'http://localhost:19100' })
  .option('token', { type: 'string', demandOption: false, default: 'local-token' })
  .option('webhook', { type: 'string', demandOption: false, default: 'http://backend-api:3000/webhook/linera/deposit-notify' })
  .parseSync()

console.log('[watcher] connecting to', argv.rpc, 'token', argv.token)

async function loop() {
  // Placeholder poll: in a real watcher, subscribe to Linera events
  const demo = { txHash: 'linera_tx_'+Date.now(), toAddress: 'user:demo', amount: 10, confirmations: 1, userId: 'demo' }
  try {
    await axios.post(argv.webhook, demo, { timeout: 5000 })
    console.log('[watcher] notified deposit', demo)
  } catch (e) {
    console.error('[watcher] webhook failed', e.message)
  }
}

setInterval(loop, 15000)
