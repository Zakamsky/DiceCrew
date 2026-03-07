import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoomStore } from '../store/roomStore.js'
import { useWebSocket } from '../hooks/useWebSocket.js'
import { WS_EVENTS } from '@dicecrew/shared'
import styles from './RoomPage.module.css'

export default function RoomPage() {
  const { code }    = useParams()
  const navigate    = useNavigate()
  const { connect, send, disconnect } = useWebSocket()

  const username  = useRoomStore(s => s.username)
  const messages  = useRoomStore(s => s.messages)
  const members   = useRoomStore(s => s.members)
  const connected = useRoomStore(s => s.connected)
  const reset     = useRoomStore(s => s.reset)

  const [text, setText]       = useState('')
  const [copied, setCopied]   = useState(false)
  const bottomRef             = useRef(null)

  useEffect(() => {
    if (!username) { navigate('/'); return }
    connect(() => {
      send(WS_EVENTS.JOIN, { roomCode: code, username })
    })
    return () => disconnect()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function handleSend() {
    const t = text.trim()
    if (!t) return
    send(WS_EVENTS.MESSAGE, { text: t })
    setText('')
  }

  function handleLeave() {
    disconnect()
    reset()
    navigate('/')
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={styles.layout}>

      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sideTop}>
          <div className={styles.logo}>⬡ DiceCrew</div>
          <div className={styles.roomCode} onClick={copyCode} title="Copy code">
            <span className={styles.codeLabel}>Room</span>
            <span className={styles.codeValue}>{code}</span>
            <span className={styles.copyHint}>{copied ? '✓ copied' : 'click to copy'}</span>
          </div>
          <div className={`${styles.status} ${connected ? styles.online : styles.offline}`}>
            <span className={styles.dot} />
            {connected ? 'connected' : 'connecting...'}
          </div>
        </div>

        <div className={styles.memberList}>
          <div className={styles.sectionLabel}>In this room</div>
          {members.map(m => (
            <div key={m.userId} className={styles.member}>
              <span className={styles.memberDot} />
              {m.username}
              {m.username === username && <span className={styles.you}> (you)</span>}
            </div>
          ))}
        </div>

        <button className={styles.leaveBtn} onClick={handleLeave}>Leave room</button>
      </aside>

      {/* Chat */}
      <main className={styles.chat}>
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.empty}>
              No messages yet. Say hi or try <code>/roll 2d6</code>
            </div>
          )}
          {messages.map(msg => <Message key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputRow}>
          <input
            className={styles.input}
            placeholder="Message or /roll 2d6+3"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            maxLength={500}
          />
          <button className={styles.sendBtn} onClick={handleSend}>Send</button>
        </div>
      </main>
    </div>
  )
}

function Message({ msg }) {
  if (msg.type === 'system') return (
    <div className={styles.msgSystem}>{msg.text}</div>
  )

  if (msg.type === 'error') return (
    <div className={styles.msgError}>⚠ {msg.text}</div>
  )

  if (msg.type === 'roll') return (
    <div className={styles.msgRoll}>
      <span className={styles.msgUser}>{msg.username}</span>
      <span className={styles.rollBadge}>🎲 rolled {msg.expression}</span>
      <div className={styles.rollResult}>
        <span className={styles.rollDice}>[{msg.kept.join(', ')}]</span>
        {msg.modifier !== 0 && <span className={styles.rollMod}>{msg.modifier > 0 ? '+' : ''}{msg.modifier}</span>}
        <span className={styles.rollTotal}> = {msg.total}</span>
      </div>
    </div>
  )

  return (
    <div className={styles.msgChat}>
      <span className={styles.msgUser}>{msg.username}</span>
      <span className={styles.msgText}>{msg.text}</span>
    </div>
  )
}
