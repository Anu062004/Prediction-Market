# PLN - Prediction Learning Network

Monorepo that extends a Linera-based prediction market with AI-driven probabilities, a Node bridge, and a React frontend.

## Quick start (local, minimal)
1. Start existing backend on 8000 (from Prediction-Market) or run the compose stack below.
2. API (AI):
   - cd pln/backend/api
   - pip install -r requirements.txt
   - uvicorn main:app --reload --port 8002
3. Bridge:
   - cd pln/backend/bridge && npm i && npm run dev
4. Frontend:
   - cd pln/frontend && npm i && npm run dev
5. Docker (db/redis/api/bridge/frontend):
   - cd pln/infra && docker compose up

Endpoints: backend-api at 8002, frontend at 3002.

Contracts are stubs under `contracts-linera/`; replace with Linera SDK integration when ready.
