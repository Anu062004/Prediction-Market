import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)

function getEnv() {
  return {
    bin: process.env.LINERA_BIN || 'linera',
    node: process.env.LINERA_NODE_URL || '',
    wallet: process.env.LINERA_WALLET || '',
    keyStore: process.env.LINERA_KEYSTORE || '',
    chain: process.env.LINERA_CHAIN_ID || '',
    tokenApp: process.env.TOKEN_APP_ID || ''
  }
}

export async function tokenTransfer(to: string, amount: string) {
  const e = getEnv()
  const args = ['call', e.tokenApp, 'transfer', '--json-argument', JSON.stringify({ to, amount }), '--node', e.node, '--wallet', e.wallet, '--key-store', e.keyStore, '--chain', e.chain]
  const { stdout, stderr } = await exec(e.bin, args)
  if (stderr && !/success/i.test(stderr)) throw new Error(stderr)
  return stdout
}
