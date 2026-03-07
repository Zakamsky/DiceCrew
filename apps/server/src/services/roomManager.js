// In-memory room state (active connections)
// Persisted room metadata lives in MongoDB

const rooms = new Map()

export function getOrCreateRoom(code) {
  if (!rooms.has(code)) {
    rooms.set(code, { code, members: new Map() })
  }
  return rooms.get(code)
}

export function joinRoom(code, userId, socket, username) {
  const room = getOrCreateRoom(code)
  room.members.set(userId, { userId, username, socket })
  return room
}

export function leaveRoom(code, userId) {
  const room = rooms.get(code)
  if (!room) return null
  room.members.delete(userId)
  if (room.members.size === 0) rooms.delete(code)
  return room
}

export function getRoomMembers(code) {
  const room = rooms.get(code)
  if (!room) return []
  return [...room.members.values()].map(m => ({ userId: m.userId, username: m.username }))
}

export function broadcastToRoom(code, senderId, payload) {
  const room = rooms.get(code)
  if (!room) return
  const message = JSON.stringify(payload)
  for (const member of room.members.values()) {
    if (member.socket.readyState === 1) {
      member.socket.send(message)
    }
  }
}

export function broadcastToOthers(code, senderId, payload) {
  const room = rooms.get(code)
  if (!room) return
  const message = JSON.stringify(payload)
  for (const member of room.members.values()) {
    if (member.userId !== senderId && member.socket.readyState === 1) {
      member.socket.send(message)
    }
  }
}
