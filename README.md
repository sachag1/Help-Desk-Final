# Help Desk - Full Stack TypeScript

Final project of the Full Stack TypeScript course (Ariel). A support-ticket system: customers open tickets on a public site, an administrator logs in to manage them.

> Status: planning phase. This section was written before the development started; the full README (installation, run, API reference...) is completed at the end of the project.

## Planning

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
