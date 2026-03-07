import fp from 'fastify-plugin'
import mongoose from 'mongoose'

async function mongoPlugin(app) {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/dicecrew'

  mongoose.connection.on('connected',    () => app.log.info('MongoDB connected'))
  mongoose.connection.on('disconnected', () => app.log.warn('MongoDB disconnected'))

  await mongoose.connect(uri)

  app.addHook('onClose', async () => {
    await mongoose.disconnect()
  })
}

export default fp(mongoPlugin, { name: 'mongo' })
