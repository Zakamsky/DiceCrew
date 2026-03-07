import { useEffect, useRef, useCallback } from 'react'
import { useRoomStore } from '../store/roomStore.js'
import { WS_EVENTS } from '@dicecrew/shared'

const WS_URL = import.meta.env.DEV
  ? 'ws://127.0.0.1:3001/ws'
  : `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`

export function useWebSocket() {
  const socketRef = useRef(null)
  const { addMessage, setMembers, setConnected } = useRoomStore()

  const connect = useCallback((onOpen) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      onOpen?.()
      return
    }

    const ws = new WebSocket(WS_URL)
    socketRef.current = ws

    ws.onopen  = () => { setConnected(true); onOpen?.() }
    ws.onclose = () => setConnected(false)

    ws.onmessage = (e) => {
      let msg
      try { msg = JSON.parse(e.data) } catch { return }
      const { event, data } = msg

      if (event === WS_EVENTS.JOINED)      setMembers(data.members)
      if (event === WS_EVENTS.ROOM_STATE)  setMembers(data.members)
      if (event === WS_EVENTS.USER_JOINED) addMessage({ type: 'system', text: `${data.username} joined the room` })
      if (event === WS_EVENTS.USER_LEFT)   addMessage({ type: 'system', text: `${data.username} left the room` })
      if (event === WS_EVENTS.MESSAGE_OUT) addMessage({ type: 'chat', username: data.username, text: data.text, timestamp: data.timestamp })
      if (event === WS_EVENTS.ROLL_RESULT) addMessage({ type: 'roll', username: data.username, expression: data.expression, rolls: data.rolls, kept: data.kept, modifier: data.modifier, total: data.total, timestamp: data.timestamp })
      if (event === WS_EVENTS.ERROR)       addMessage({ type: 'error', text: data.message })
    }
  }, [addMessage, setMembers, setConnected])

  const send = useCallback((event, data = {}) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ event, data }))
    }
  }, [])

  const disconnect = useCallback(() => {
    socketRef.current?.close()
  }, [])

  useEffect(() => () => disconnect(), [disconnect])

  return { connect, send, disconnect }
}