import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoomStore } from '../store/roomStore.js'
import { createRoom, getRoom } from '../api/rooms.js'
import styles from './HomePage.module.css'

export default function HomePage() {
  const navigate  = useNavigate()
  const setRoom   = useRoomStore(s => s.setRoom)
  const setUsername = useRoomStore(s => s.setUsername)

  const [username, setName]   = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [roomName, setRoomName] = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [tab, setTab]         = useState('join') // 'join' | 'create'

  async function handleJoin() {
    if (!username.trim() || !joinCode.trim()) return setError('Enter your name and room code')
    setLoading(true); setError('')
    const room = await getRoom(joinCode.trim())
    if (!room) { setLoading(false); return setError('Room not found') }
    setUsername(username.trim())
    setRoom(room.code)
    navigate(`/room/${room.code}`)
  }

  async function handleCreate() {
    if (!username.trim()) return setError('Enter your name first')
    setLoading(true); setError('')
    try {
      const room = await createRoom(roomName.trim())
      setUsername(username.trim())
      setRoom(room.code)
      navigate(`/room/${room.code}`)
    } catch {
      setLoading(false)
      setError('Failed to create room')
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.die}>⬡</span>
          <span className={styles.title}>DiceCrew</span>
        </div>
        <p className={styles.sub}>Roll together, in real time.</p>

        <div className={styles.nameRow}>
          <input
            className={styles.input}
            placeholder="Your name"
            value={username}
            onChange={e => setName(e.target.value)}
            maxLength={32}
          />
        </div>

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'join' ? styles.active : ''}`} onClick={() => setTab('join')}>Join room</button>
          <button className={`${styles.tab} ${tab === 'create' ? styles.active : ''}`} onClick={() => setTab('create')}>Create room</button>
        </div>

        {tab === 'join' && (
          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Room code  e.g. A3FX9K"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              maxLength={6}
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button className={styles.btn} onClick={handleJoin} disabled={loading}>
              {loading ? '...' : 'Join →'}
            </button>
          </div>
        )}

        {tab === 'create' && (
          <div className={styles.form}>
            <input
              className={styles.input}
              placeholder="Room name  (optional)"
              value={roomName}
              onChange={e => setRoomName(e.target.value)}
              maxLength={48}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
            />
            <button className={`${styles.btn} ${styles.btnCreate}`} onClick={handleCreate} disabled={loading}>
              {loading ? '...' : 'Create →'}
            </button>
          </div>
        )}

        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  )
}
