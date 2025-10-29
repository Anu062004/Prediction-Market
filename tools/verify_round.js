#!/usr/bin/env node
const crypto = require('node:crypto')

function hmac(serverSeed, clientSeed, nonce){
  const msg = `${clientSeed}:${nonce}`
  const h = crypto.createHmac('sha256', serverSeed).update(msg).digest('hex')
  const n = parseInt(h.slice(0,8),16)
  return (n % 1000000) / 1000000
}

if (require.main === module) {
  const [serverSeed, clientSeed='client', nonce='0'] = process.argv.slice(2)
  if(!serverSeed) { console.error('usage: verify_round <serverSeed> [clientSeed] [nonce]'); process.exit(1) }
  console.log(hmac(serverSeed, clientSeed, nonce))
}
