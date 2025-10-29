# Linera Integration Guide

Follow the official manual: [linera.dev](https://linera.dev/)

## 1. Install and configure CLI
- Install the CLI per docs.
- Claim a microchain on Testnet or run local validators.
- Export environment values:
```
LINERA_BIN=linera
LINERA_NODE_URL=http://localhost:19100
LINERA_WALLET=/path/to/wallet.json
LINERA_KEYSTORE=/path/to/keystore.json
LINERA_CHAIN_ID=<your_chain_id>
```

## 2. Publish token app (fungible token)
Use the manual to publish a token application and note its App ID (`TOKEN_APP_ID`).

## 3. Set envs
- backend-api: set LINERA_* and TOKEN_APP_ID
- wallet-service: set LINERA_* and TOKEN_APP_ID

## 4. Run stack (Docker)
```
docker compose -f infra/docker-compose.yml up --build -d
```

## 5. Flows
- Deposits: `linera-watcher` posts /webhook/linera/deposit-notify when it sees transfers to deposit addresses.
- Withdrawals: `wallet-service` calls `linera call <TOKEN_APP_ID> transfer` to send tokens on-chain.
- Games: off-chain gameplay, on-chain settlement optional via backend-api calling `linera.ts` wrappers.

See [The Linera Manual](https://linera.dev/) for details on publishing apps and managing wallets.
