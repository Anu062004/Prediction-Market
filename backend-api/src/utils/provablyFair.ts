import crypto from 'node:crypto'

export function randomSeed(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex')
}

export function hashSeed(seed: string): string {
  return crypto.createHash('sha256').update(seed).digest('hex')
}

export function hmacRng(serverSeed: string, clientSeed: string, nonce: number | string): number {
  const msg = `${clientSeed}:${nonce}`
  const h = crypto.createHmac('sha256', serverSeed).update(msg).digest('hex')
  // map first 8 hex chars to a float in [0,1)
  const n = parseInt(h.slice(0, 8), 16)
  return (n % 1_000_000) / 1_000_000
}

export function oddsFromP(p: number): { a: number, b: number } {
  const eps = 1e-9
  const a = Math.max(1.01, 1 / Math.max(eps, p))
  const b = Math.max(1.01, 1 / Math.max(eps, 1 - p))
  return { a, b }
}
