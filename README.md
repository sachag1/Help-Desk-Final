# Help Desk - Full Stack TypeScript

## Project Description
A support-ticket (Help Desk) system. Customers open a ticket on a public site (form with validation, then a confirmation page). An administrator logs in to an admin area where tickets can be listed, searched, filtered, viewed, updated (status and priority), deleted and exported to CSV. A dashboard shows the main counters.

## Starting Point
The project starts from the last Full Stack assignment of the course (users management, Vite + React + Express + MongoDB); its first commit is in the git history. What was kept as the base and adapted:
- the `server / db / type` structure, the MongoDB Native Driver with a typed collection and separate database actions, the conversion of a MongoDB document to a public object, the ObjectId check, parsing of `unknown` input with type guards, CORS;
- the generic `ApiResponse<T>` (success or error), the typed `fetch` request function and the `services` layer, `VITE_API_URL`;
- the `Loading` and `ErrorMessage` components, typed props and state, the Radix `Dialog` (user details became ticket details) and `AlertDialog` (delete confirmation), `useEffect` for the first load, and the `useUsers` hook (became `useTickets`).

New in this project: React Router with pages, the ticket model and its validation (client and server), administrator authentication and protected endpoints, PATCH update, dashboard, search and filters, Radix Select, CSV export.

## Technologies
- Client: Vite, React 19, TypeScript (strict), TailwindCSS, Radix UI (Dialog, AlertDialog, Select), React Router.
- Server: Node.js, Express 5, TypeScript (strict), MongoDB Native Driver, CORS. Passwords are hashed with scrypt and login tokens are signed with HMAC-SHA256, both with the built-in Node.js `crypto` module (no extra library).
- No `any` and no `as any` anywhere.

## Pages
| Route | Page | Access |
|---|---|---|
| `/` | Open a ticket (public form) | public |
| `/ticket-submitted` | Confirmation (only after the server saved the ticket) | public |
| `/admin/login` | Administrator login | public |
| `/admin` | Dashboard | admin |
| `/admin/tickets` | Tickets management (list, search, filters, details and update, delete, CSV) | admin |
| `*` | Not found | public |

## Project Structure
```
server/
  server/   app.ts (Express app, CORS), index.ts (start), http.ts (answers), validation.ts (parsing of unknown input),
            csv.ts, routes/tickets.ts, routes/admin.ts
  db/       index.ts (connection, typed collections), ticketActions.ts, adminActions.ts, objectId.ts, errors.ts
  auth/     config.ts, password.ts (scrypt), token.ts (signed token), requireAdmin.ts (middleware)
  type/     ticket.ts, admin.ts, api.ts
  scripts/  seedAdmin.ts (creates the administrator)
  tests/    api.test.js (end-to-end API test)
client/src/
  pages/        one component per route
  components/   Layout, ProtectedRoute, TicketForm, SelectField, TicketList, TicketCard, TicketDetailsDialog,
                DeleteTicketDialog, TicketFiltersBar, SearchBar, ExportCsvButton, StatCard, Badges, Loading, ErrorMessage
  services/     http.ts (the only fetch for JSON), ticketsApi.ts, authApi.ts, authStorage.ts
  hooks/        useTickets.ts, useAuth.ts
  context/      authContext.ts, AuthProvider.tsx
  types/        ticket.ts, api.ts, auth.ts, guards.ts (type guards)
  utils/        validateTicketForm.ts, ticketFilters.ts, ticketStats.ts, format.ts, download.ts, errors.ts
```

## Data Model
Database `helpdesk` (name set by `MONGODB_DB`), two collections.
- `tickets`: `fullName`, `email`, `phone`, `title`, `description`, `category` (Hardware, Software, Network, Account, Other), `priority` (Low, Medium, High), `status` (Open, In Progress, Resolved), `createdAt`, `updatedAt` (dates). The server sets `status = Open` and both dates on creation and refreshes `updatedAt` on every update; the client can never send them.
- `admins`: `username` (unique), `passwordHash` (scrypt with a random salt, never plain text).

Types: `CreateTicketInput` (form), `TicketDocument` (MongoDB), `PublicTicket` (sent to the client: string `id`, ISO dates), `UpdateTicketInput` (only `status` and `priority`), `AdminDocument`, `AdminLoginInput`, `LoginResult`.

## API
Answers are always `{ "success": true, "data": ... }` or `{ "success": false, "error": "message" }`.

| Method | Endpoint | Access | Purpose | Main status codes |
|---|---|---|---|---|
| POST | `/tickets` | public | Create a ticket | 201, 400 |
| POST | `/admin/login` | public | Login, returns `{ token, username, expiresAt }` | 200, 400 (missing data), 401 (wrong login) |
| GET | `/tickets` | admin | All tickets, newest first | 200 |
| GET | `/tickets/export/csv` | admin | CSV file (`tickets.csv`) | 200 |
| GET | `/tickets/:id` | admin | One ticket | 200, 400 (invalid id), 404 |
| PATCH | `/tickets/:id` | admin | Update `status` and/or `priority` | 200, 400, 404 |
| DELETE | `/tickets/:id` | admin | Delete a ticket | 200, 400, 404 |

Admin endpoints answer 401 without a valid token and 403 when the token belongs to an administrator that no longer exists. A MongoDB failure gives 503 (unavailable) or 500, with a generic message.
CSV columns: Ticket ID, Title, Customer Name, Email, Phone, Category, Priority, Status, Description, Created At, Updated At.

## Authentication
The administrator exists beforehand: `npm run seed:admin` creates it from `ADMIN_USERNAME` / `ADMIN_PASSWORD` (the password is stored hashed). `POST /admin/login` checks the password and returns a signed token (JWT format, HS256, valid 8 hours). The client keeps it in `sessionStorage`, sends it as `Authorization: Bearer <token>` on every protected call and removes it on Logout (or when the server answers 401). React Router redirects visitors that are not logged in to `/admin/login`, but the protection that counts is on the server: every endpoint except `POST /tickets` and `POST /admin/login` goes through the `requireAdmin` middleware. A wrong login always answers "Invalid username or password" (same message for an unknown user).

## Environment Variables
`server/.env` (copy `server/.env.example`):

| Variable | Meaning |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB` | database name (default `helpdesk`) |
| `PORT` | server port (default 3000) |
| `CORS_ORIGINS` | allowed client origins, comma separated |
| `AUTH_SECRET` | secret that signs the login tokens, at least 32 random characters |
| `ADMIN_USERNAME`, `ADMIN_PASSWORD` | administrator created by the seed script (password of at least 8 characters) |

`client/.env` (copy `client/.env.example`): `VITE_API_URL` is the address of the server, for example `http://localhost:3000`.
The `.env` files are in `.gitignore`; only the `.env.example` files are committed.

## Installation
Requirements: Node.js 22 or newer (the server uses `node --env-file`) and a MongoDB server.
```bash
cd server
npm install
cp .env.example .env          # then edit the values
npm run build
npm run seed:admin            # creates the administrator
cd ../client
npm install
cp .env.example .env
```

## Run
```bash
# terminal 1 - server (http://localhost:3000)
cd server && npm start
# terminal 2 - client (http://localhost:3005)
cd client && npm run dev
```
Open http://localhost:3005 for the public form and http://localhost:3005/admin/login for the administrator.

Checks: `cd server && npm test` compiles and runs the end-to-end API test (it empties the `tickets` and `admins` collections of the database named in `.env`, so use a test database); `cd client && npm run build && npm run lint`.

---

# Planning
This planning section was written before the development started.

### Starting point
The project starts from the last Full Stack assignment of the course (users management): Vite + React + TypeScript + Tailwind + Radix UI client, Express + TypeScript + MongoDB server (`server / db / type`), generic `ApiResponse<T>`, typed `fetch` service, `Loading` / `ErrorMessage` components, type guards for external data. Users are replaced by tickets; routing, authentication, update, dashboard, filters and CSV export are new.

### Pages (React Router)
| Route | Page | Role | Access |
|---|---|---|---|
| `/` | New ticket | Public controlled form with client validation | public |
| `/ticket-submitted` | Confirmation | Shown only after the server saved the ticket (shows the ticket id) | public |
| `/admin/login` | Login | Administrator login (username + password) | public |
| `/admin` | Dashboard | Totals: Total / Open / In Progress / Resolved / High priority | admin |
| `/admin/tickets` | Tickets management | List, search, filters, details dialog, update, delete, export CSV | admin |
| `*` | Not found | Friendly 404 | public |

### Main components
`Layout` (responsive navigation), `ProtectedRoute`, `TicketForm`, `SelectField` (Radix Select), `TicketList`, `TicketCard`, `TicketDetailsDialog` (Radix Dialog: loads the ticket by id, edits status and priority), `DeleteTicketDialog` (Radix AlertDialog), `SearchBar`, `TicketFilters`, `StatCard`, `Loading`, `ErrorMessage`.

### Main types
- Constants and unions: `TicketCategory` (Hardware, Software, Network, Account, Other), `TicketPriority` (Low, Medium, High), `TicketStatus` (Open, In Progress, Resolved).
- `CreateTicketInput` (what the form sends), `TicketDocument` (stored in MongoDB, dates as `Date`), `PublicTicket` (returned to the client, `id` string and ISO dates), `UpdateTicketInput` (only `status` and `priority` may change), `TicketIdParams`.
- `AdminDocument` (username + password hash), `AdminLoginInput`, `LoginResult`, `AuthTokenPayload`.
- `ApiResponse<T>` = success `{ success: true, data }` or error `{ success: false, error }`.
- Client only: `TicketFormState`, `TicketFormErrors`, `TicketFilters`, component props and callback props, `AuthSession`.

### MongoDB
Database `helpdesk`, two typed collections:
- `tickets`: fullName, email, phone, title, description, category, priority, status, createdAt, updatedAt.
- `admins`: username (unique), passwordHash (scrypt with a random salt; never plain text). The administrator exists beforehand and is created by a seed script (no registration).

### API endpoints
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/tickets` | public | Create a ticket (server sets status Open, createdAt, updatedAt) |
| POST | `/admin/login` | public | Login, returns a signed token |
| GET | `/tickets` | admin | All tickets |
| GET | `/tickets/export/csv` | admin | CSV file |
| GET | `/tickets/:id` | admin | One ticket |
| PATCH | `/tickets/:id` | admin | Update status / priority, refreshes `updatedAt` |
| DELETE | `/tickets/:id` | admin | Delete a ticket |

Public endpoints: `POST /tickets`, `POST /admin/login`. Protected endpoints: every other one (Bearer token checked by the server; React only hides links).

### Responsibilities
- **React**: pages, typed state and events, client-side validation, routing and route protection, search and filters on the loaded array, dashboard counters computed from the array.
- **API service layer** (`services/`): the only place that uses `fetch`; generic typed request function, adds the token, turns an error response into a typed exception.
- **Express** (`server/`): routes, request parsing of `unknown` input, validation, authentication middleware, status codes, CSV generation.
- **Database layer** (`db/`): MongoDB driver only; typed collections; converts documents to public objects; no `Request` / `Response`.
