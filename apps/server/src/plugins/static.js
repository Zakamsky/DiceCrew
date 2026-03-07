import fp from 'fastify-plugin'
import staticPlugin from '@fastify/static'
import { fileURLToPath } from 'url'
import { join, dirname } from 'path'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC_DIR = join(__dirname, '..', '..', 'public')

async function staticFilesPlugin(app) {
  if (!existsSync(PUBLIC_DIR)) {
    app.log.warn('No public/ directory — skipping static (dev mode)')
    return
  }

  await app.register(staticPlugin, { root: PUBLIC_DIR, prefix: '/' })

  app.setNotFoundHandler((req, reply) => {
    if (req.url.startsWith('/api') || req.url.startsWith('/ws')) {
      reply.code(404).send({ error: 'Not found' })
      return
    }
    reply.sendFile('index.html')
  })
}

export default fp(staticFilesPlugin, { name: 'static-files' })