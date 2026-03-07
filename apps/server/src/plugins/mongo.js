import fp from 'fastify-plugin'
import mongoose from 'mongoose'

async function mongoPlugin(app) {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dicecrew'

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    })
    app.log.info('MongoDB connected')
  } catch (err) {
    app.log.error({ err }, 'MongoDB connection failed')
    throw err
  }

  app.addHook('onClose', async () => {
    await mongoose.disconnect()
    app.log.info('MongoDB disconnected')
  })
}

export default fp(mongoPlugin, { name: 'mongo' })