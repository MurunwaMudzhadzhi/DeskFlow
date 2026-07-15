# DeskFlow Backend

Express + MongoDB API powering the DeskFlow IT Service Request Portal. See the [root README](../README.md) for the full project overview, architecture diagram, and deployment instructions.

## Quick Start

```bash
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev             # http://localhost:5000
node src/utils/seed.js  # creates employee1 / admin1 demo accounts
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart on change) |
| `npm start` | Start in production mode |
| `node src/utils/seed.js` | Seed demo employee + admin accounts |

## Key Endpoints

See `/api-docs` for the full interactive spec once the server is running.

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/tickets` (employee)
- `GET /api/tickets` (employee: own tickets · admin: all tickets)
- `GET /api/tickets/stats`
- `GET /api/tickets/:id`
- `PUT /api/tickets/:id` (admin)

## Testing

The backend has a Jest + Supertest suite covering authentication, ticket creation, role-based scoping, admin-only status updates, validation, and error normalization — the same scenarios manually verified via Swagger during development. The Mongoose model layer is mocked, so the suite runs without a live MongoDB connection.

```bash
npm test              # run the full suite once
npm run test:watch    # re-run on file changes
npm run test:coverage # run with a coverage report
```

**Structure:**
```
tests/
├── setup.js                          # deterministic test env vars (JWT_SECRET, etc.)
├── unit/
│   ├── auth.middleware.test.js       # authenticateJWT, authorizeEmployee, authorizeAdmin
│   ├── generateToken.test.js         # JWT signing/claims
│   └── errorHandler.test.js          # Mongoose error normalization
└── integration/
    ├── auth.routes.test.js           # POST /api/auth/login, GET /api/auth/me
    └── tickets.routes.test.js        # full ticket CRUD + role-based access control
```

`src/app.js` holds the pure Express app configuration (no DB connection, no `listen()`), so tests can import it directly via `supertest` without needing a live database or open port. `src/server.js` is the thin process entry point that connects to MongoDB and boots the app — this split is what makes the app testable in isolation.

## Middleware

- `authenticateJWT` — verifies the `Authorization: Bearer <token>` header
- `authorizeEmployee` / `authorizeAdmin` — role guards
- `runValidation` (express-validator) — returns `400` with field-level errors
- `notFound` / `errorHandler` — centralized 404 + error normalization
