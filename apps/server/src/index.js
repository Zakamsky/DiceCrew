import 'dotenv/config'
import Fastify from 'fastify'
import mongoPlugin       from './plugins/mongo.js'
import wsPlugin          from './plugins/websocket.js'
import corsPlugin        from './plugins/cors.js'
import staticFilesPlugin from './plugins/static.js'
import healthRoutes      from './routes/health.js'
import roomRoutes        from './routes/rooms.js'

const isProd = process.env.NODE_ENV === 'production'

const app = Fastify({
  logger: isProd
    ? true
    : { transport: { target: 'pino-pretty' } }
})

await app.register(corsPlugin)
await app.register(mongoPlugin)
await app.register(wsPlugin)
await app.register(staticFilesPlugin)

await app.register(healthRoutes)
await app.register(roomRoutes, { prefix: '/api' })

const PORT = process.env.PORT || 3001
try {
  await app.listen({ port: PORT, host: '0.0.0.0' })
} catch (err) {
  app.log.error(err)
  process.exit(1)
}