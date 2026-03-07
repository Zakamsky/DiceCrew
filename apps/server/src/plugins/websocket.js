import fp from 'fastify-plugin'
import websocket from '@fastify/websocket'
import { nanoid } from 'nanoid'
import { WS_EVENTS, MAX_MESSAGE_LENGTH, isRollCommand, extractExpression } from '@dicecrew/shared'
import { joinRoom, leaveRoom, getRoomMembers, broadcastToRoom, broadcastToOthers } from '../services/roomManager.js'
import { rollDice } from '../services/dice.js'

async function wsPlugin(app) {
  await app.register(websocket)

  app.get('/ws', { websocket: true }, (socket, req) => {
    const userId = nanoid(8)
    let currentRoom = null
    let username    = 'Anonymous'

    socket.on('message', (raw) => {
      let msg
      try {
        msg = JSON.parse(raw.toString())
      } catch {
        return socket.send(JSON.stringify({ event: WS_EVENTS.ERROR, data: { message: 'Invalid JSON' } }))
      }

      const { event, data = {} } = msg

      // JOIN
      if (event === WS_EVENTS.JOIN) {
        const code = (data.roomCode || '').toUpperCase().trim()
        if (!code) return

        username    = (data.username || 'Anonymous').slice(0, 32)
        currentRoom = code

        joinRoom(code, userId, socket, username)

        // confirm to this user
        socket.send(JSON.stringify({
          event: WS_EVENTS.JOINED,
          data:  { roomCode: code, userId, username, members: getRoomMembers(code) },
        }))

        // notify others
        broadcastToOthers(code, userId, {
          event: WS_EVENTS.USER_JOINED,
          data:  { username },
        })

        app.log.info(`[room:${code}] ${username} joined`)
        return
      }

      if (!currentRoom) return

      // MESSAGE
      if (event === WS_EVENTS.MESSAGE) {
        const text = (data.text || '').slice(0, MAX_MESSAGE_LENGTH).trim()
        if (!text) return

        // check if it's a roll command
        if (isRollCommand(text)) {
          const expression = extractExpression(text)
          const result     = rollDice(expression)

          if (!result) {
            return socket.send(JSON.stringify({
              event: WS_EVENTS.ERROR,
              data:  { message: `Invalid dice expression: ${expression}` },
            }))
          }

          broadcastToRoom(currentRoom, userId, {
            event: WS_EVENTS.ROLL_RESULT,
            data:  { username, ...result, timestamp: Date.now() },
          })
          return
        }

        broadcastToRoom(currentRoom, userId, {
          event: WS_EVENTS.MESSAGE_OUT,
          data:  { username, text, timestamp: Date.now() },
        })
        return
      }

      // ROLL (direct, without /roll prefix)
      if (event === WS_EVENTS.ROLL) {
        const result = rollDice(data.expression || '')
        if (!result) {
          return socket.send(JSON.stringify({
            event: WS_EVENTS.ERROR,
            data:  { message: `Invalid dice expression` },
          }))
        }
        broadcastToRoom(currentRoom, userId, {
          event: WS_EVENTS.ROLL_RESULT,
          data:  { username, ...result, timestamp: Date.now() },
        })
      }
    })

    socket.on('close', () => {
      if (!currentRoom) return
      const room = leaveRoom(currentRoom, userId)
      if (room !== null) {
        broadcastToOthers(currentRoom, userId, {
          event: WS_EVENTS.USER_LEFT,
          data:  { username },
        })
      }
      app.log.info(`[room:${currentRoom}] ${username} left`)
    })
  })
}

export default fp(wsPlugin, { name: 'websocket' })
