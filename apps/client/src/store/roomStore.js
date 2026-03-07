import { create } from 'zustand'

export const useRoomStore = create((set) => ({
  roomCode:  null,
  username:  '',
  members:   [],
  messages:  [],
  connected: false,

  setRoom:      (code) => set({ roomCode: code }),
  setUsername:  (name) => set({ username: name }),
  setMembers:   (members) => set({ members }),
  setConnected: (connected) => set({ connected }),

  addMessage: (msg) => set((state) => ({
    messages: [...state.messages, { ...msg, id: Date.now() + Math.random() }],
  })),

  reset: () => set({ roomCode: null, members: [], messages: [], connected: false }),
}))
