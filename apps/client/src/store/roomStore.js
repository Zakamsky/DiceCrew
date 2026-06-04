import { create } from 'zustand'

const STORAGE_KEY = 'dicecrew-session'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession({ username, roomCode }) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ username, roomCode: roomCode ?? null }))
}

function clearSession() {
  sessionStorage.removeItem(STORAGE_KEY)
}

const saved = loadSession()

export const useRoomStore = create((set, get) => ({
  roomCode:  saved?.roomCode ?? null,
  username:  saved?.username ?? '',
  members:   [],
  messages:  [],
  connected: false,

  setRoom: (code) => {
    set({ roomCode: code })
    const { username } = get()
    if (username) saveSession({ username, roomCode: code })
  },

  setUsername: (name) => {
    set({ username: name })
    const { roomCode } = get()
    saveSession({ username: name, roomCode })
  },

  hydrateSession: () => {
    const session = loadSession()
    if (!session?.username) return
    set({ username: session.username, roomCode: session.roomCode ?? null })
  },

  setMembers:   (members) => set({ members }),
  setConnected: (connected) => set({ connected }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Date.now() + Math.random() }],
  })),

  reset: () => {
    const { username } = get()
    if (username) saveSession({ username, roomCode: null })
    else clearSession()
    set({ roomCode: null, members: [], messages: [], connected: false })
  },
}))
