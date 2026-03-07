import { nanoid } from 'nanoid'
import { ROOM_CODE_LENGTH } from '@dicecrew/shared'
import Room from '../models/Room.js'

async function roomRoutes(app) {
  // POST /api/rooms — create a new room
  app.post('/rooms', async (req, reply) => {
    const code = nanoid(ROOM_CODE_LENGTH).toUpperCase()
    const name = req.body?.name || ''

    const room = await Room.create({ code, name })
    return reply.code(201).send({ code: room.code, name: room.name })
  })

  // GET /api/rooms/:code — check if room exists
  app.get('/rooms/:code', async (req, reply) => {
    const room = await Room.findOne({
      code:   req.params.code.toUpperCase(),
      status: 'active',
    })
    if (!room) return reply.code(404).send({ error: 'Room not found' })
    return { code: room.code, name: room.name, createdAt: room.createdAt }
  })
}

export default roomRoutes
