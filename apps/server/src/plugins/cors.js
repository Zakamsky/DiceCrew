import fp from 'fastify-plugin'
import cors from '@fastify/cors'

async function corsPlugin(app) {
  await app.register(cors, {
    origin: process.env.NODE_ENV === 'production'
      ? false
      : ['http://localhost:5173'],
    credentials: true,
  })
}

export default fp(corsPlugin, { name: 'cors' })
