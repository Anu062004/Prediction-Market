import { FastifyInstance, FastifyPluginOptions } from 'fastify'
import fp from 'fastify-plugin'

export default fp(async function auth(fastify: FastifyInstance, _opts: FastifyPluginOptions) {
  fastify.register(import('@fastify/jwt'), {
    secret: process.env.JWT_SECRET || 'dev-secret'
  })

  fastify.decorate('auth', async (request: any, reply: any) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({ error: 'Unauthorized' })
    }
  })
}) as any

export async function verifyWalletSignature(_address: string, _message: string, _signature: string): Promise<boolean> {
  // TODO: integrate real Linera / wallet signature verification
  return true
}

declare module 'fastify' {
  interface FastifyInstance {
    auth: any
  }
}
