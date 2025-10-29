import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(execFile)

export type LineraEnv = {
  LINERA_BIN?: string
  LINERA_NODE_URL?: string
  LINERA_WALLET?: string
  LINERA_KEYSTORE?: string
  LINERA_CHAIN_ID?: string
  TOKEN_APP_ID?: string
}

function env(): LineraEnv {
  return {
    LINERA_BIN: process.env.LINERA_BIN || 'linera',
    LINERA_NODE_URL: process.env.LINERA_NODE_URL,
    LINERA_WALLET: process.env.LINERA_WALLET,
    LINERA_KEYSTORE: process.env.LINERA_KEYSTORE,
    LINERA_CHAIN_ID: process.env.LINERA_CHAIN_ID,
    TOKEN_APP_ID: process.env.TOKEN_APP_ID
  }
}

export async function lineraCall(appId: string, method: string, jsonArgument: any) {
  const e = env()
  const args = [
    'call', appId, method, '--json-argument', JSON.stringify(jsonArgument),
    '--node', e.LINERA_NODE_URL || '',
    '--wallet', e.LINERA_WALLET || '',
    '--key-store', e.LINERA_KEYSTORE || '',
    '--chain', e.LINERA_CHAIN_ID || ''
  ].filter(Boolean)
  const { stdout, stderr } = await exec(e.LINERA_BIN!, args)
  if (stderr && !/success/i.test(stderr)) {
    throw new Error(stderr)
  }
  return stdout
}

export async function tokenTransfer(to: string, amount: string) {
  const e = env()
  if (!e.TOKEN_APP_ID) throw new Error('TOKEN_APP_ID not set')
  return lineraCall(e.TOKEN_APP_ID, 'transfer', { to, amount })
}
