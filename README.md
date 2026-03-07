# 🎲 DiceCrew

> Real-time dice rolling rooms for tabletop RPG players and friends.

## What is this?

DiceCrew is a PWA (Progressive Web App) that lets you create a room, share a code, and roll dice together in real time — no login required to play. Think Scrum Poker, but for D&D.

## Features

- **Rooms** — create a room, get a short code, share it with your crew
- **Real-time chat** — messages broadcast instantly via WebSocket
- **Dice rolls** — type `/roll 2d6+3` and everyone sees the result
- **Roll presets** — save your favourite rolls as quick-access buttons *(auth required)*
- **Google login** — optional, enables presets sync across devices

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Zustand, React Router |
| Backend | Fastify, @fastify/websocket |
| Database | MongoDB (Mongoose) |
| Auth | Passport.js + Google OAuth 2.0 + JWT |
| Shared | Zod validators, dice parser, WS event constants |
| Monorepo | npm workspaces |

## Project Structure

```
dicecrew/
├── apps/
│   ├── client/          # React PWA (Vite, port 5173 in dev)
│   └── server/          # Fastify API + WebSocket (port 3001)
├── packages/
│   └── shared/          # Common code: dice parser, validators, constants
├── package.json         # Workspace root, shared scripts
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB running locally on default port `27017`

### Installation

```bash
git clone https://github.com/yourname/dicecrew.git
cd dicecrew
npm install
```

### Environment

```bash
cp .env.example .env
# edit .env — set MONGO_URI and SESSION_SECRET at minimum
```

### Development

```bash
npm run dev
```

Starts both client (`:5173`) and server (`:3001`) concurrently.  
Vite proxies `/api` and `/ws` to the server — no CORS issues.

### Production build

```bash
npm run build        # builds client into apps/server/public/
npm run start        # serves everything from port 3001
```

In production Fastify serves the React static files alongside the API and WebSocket — single port, single process.

## WebSocket Events

| Event | Direction | Payload |
|---|---|---|
| `join` | client → server | `{ roomCode, username }` |
| `message` | client → server | `{ text }` |
| `message` | server → client | `{ username, text, timestamp }` |
| `roll` | client → server | `{ expression }` e.g. `"2d6+3"` |
| `roll_result` | server → client | `{ username, expression, rolls, total }` |
| `user_joined` | server → client | `{ username }` |
| `user_left` | server → client | `{ username }` |

## Dice Syntax

```
/roll 1d20        → roll one 20-sided die
/roll 2d6+3       → roll two d6 and add 3
/roll 4d6kh3      → roll four d6, keep highest 3 (advantage)
```

Dice logic runs on the server — results cannot be faked by the client.

## Roadmap

- [x] Monorepo scaffold
- [x] Fastify server + WebSocket rooms
- [x] Basic React chat UI
- [ ] Dice expression parser (`/roll` command)
- [ ] Roll history in room
- [ ] Google OAuth + JWT
- [ ] User presets (saved rolls)
- [ ] PWA manifest + offline support
- [ ] Deploy to Render + MongoDB Atlas

## License

AGPL-3.0
