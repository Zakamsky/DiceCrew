import 'dotenv/config'
import Fastify from 'fastify'
import mongoPlugin  from './plugins/mongo.js'
import wsPlugin     from './plugins/websocket.js'
import corsPlugin   from './plugins/cors.js'
import healthRoutes from './routes/health.js'
import roomRoutes   from './routes/rooms.js'

const app = Fastify({ logger: { transport: { target: 'pino-pretty' } } })

// plugins
await app.register(corsPlugin)
await app.register(mongoPlugin)
await app.register(wsPlugin)

// routes
await app.register(healthRoutes)
await app.register(roomRoutes, { prefix: '/api' })

const PORT = process.env.PORT || 3001
try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}
