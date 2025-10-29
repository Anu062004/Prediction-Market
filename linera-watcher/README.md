# Linera Watcher

Watches a Linera fungible token microchain and notifies backend on deposits.

Usage:

```bash
npm i
node watcher.js --rpc http://localhost:19100 --token local-token --webhook http://localhost:3000/webhook/linera/deposit-notify
```
