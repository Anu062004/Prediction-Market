import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import auth from '../src/auth'
import gamesRoutes from '../src/routes/games'

function stubAuth() {
  return async (app: any) => {
    app.decorate('auth', async (_req: any, _rep: any) => {})
  }
}

test('start round returns seed hash', async () => {
  const app = Fastify()
  app.register(websocket)
  app.register(stubAuth() as any)
  app.register(async (i) => { await gamesRoutes(i as any) })

  const res = await app.inject({
    method: 'POST',
    url: '/api/games/mines/rounds'
  })
  expect(res.statusCode).toBe(200)
  const body = res.json()
  expect(body.roundId).toBeDefined()
  expect(body.serverSeedHash).toHaveLength(64)
})
