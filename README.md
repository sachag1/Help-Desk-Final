# Users management (Full Stack)

Vite + React + TypeScript + TailwindCSS + Radix UI (Dialog, AlertDialog) on the client; Express + TypeScript + MongoDB (`users` collection) on the server.

## Server
```bash
cd server
npm install
cp .env.example .env      # set MONGODB_URI (never commit .env)
npm run build
npm start                 # http://localhost:3000
```
## Client
```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:3000
npm run dev               # http://localhost:3005
```
API: `POST /users`, `GET /users`, `GET /users/:id`, `DELETE /users/:id` (answers `{ success, data }` or `{ success: false, error }`, never a password).
