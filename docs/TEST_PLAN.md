# DeskFlow Test Plan

**Sprint day:** 2 (Production Readiness Sprint) | **Date:** 2026-10-12 | **Skill:** TEST

## 1. Scope

Backend API in `backend/src` (Express + Mongoose, JWT auth, roles: `employee` and `admin`). The frontend is out of scope for this sprint.

## 2. Tooling and approach

| Item | Choice |
|---|---|
| Runner | Jest (`npm test`, `npm run test:coverage`, run with `--runInBand`) |
| HTTP testing | Supertest against the Express `app` (no listening server) |
| Data layer | Mongoose models mocked, so no live MongoDB is needed |
| Environment | `NODE_ENV=test`, shared setup in `tests/setup.js` |
| Coverage scope | `controllers/`, `middleware/`, `utils/` (excluding `utils/seed.js`) |

## 3. Baseline (audited 2026-10-12)

51 tests across 5 suites, all passing.

| Metric | Result |
|---|---|
| Statements | 98.58% |
| Branches | 90.66% |
| Functions | 100% |
| Lines | 98.52% |

Uncovered lines: `ticketController.js` L57, `auth.js` L47, `errorHandler.js` L17 and L31-32 (branches), `generateToken.js` L18 (branch).

## 4. Endpoint inventory

| # | Method | Path | Guards | Tests | Status |
|---|---|---|---|---|---|
| 1 | POST | `/api/auth/login` | validation | 7 | Covered |
| 2 | GET | `/api/auth/me` | JWT | 3 | Covered |
| 3 | POST | `/api/tickets` | employee only, validation | 6 | Covered |
| 4 | GET | `/api/tickets` | role-scoped, filters | 4 | Covered |
| 5 | GET | `/api/tickets/stats` | role-scoped | 2 | Covered |
| 6 | GET | `/api/tickets/:id` | owner or admin | 4 | Covered |
| 7 | PUT | `/api/tickets/:id` | admin only, validation | 5 | Covered |

Every endpoint has at least one test. The gaps are in depth, not breadth (section 6).

## 5. Unit vs integration split

**Unit tests (20)**, isolated functions with no HTTP:
- `auth.middleware`: valid, missing, malformed and expired tokens; `authorizeEmployee` / `authorizeAdmin` role checks (10)
- `generateToken`: payload claims, wrong-secret verification, expiry (3)
- `errorHandler` / `notFound`: status mapping for ApiError, ValidationError, duplicate key, CastError, unknown error, production stack hiding, 404 (7)

**Integration tests (31)**, full request through routes, validators, middleware and controllers with models mocked:
- Auth: login success and the five failure modes, `/me` (10)
- Tickets: creation, listing with role scoping and filters, fetch by id with ownership, stats, status update (21)

**Key behaviours covered**
- *Ticket creation:* employee succeeds (201), admin forbidden (403), no token (401), short title/description, missing or invalid priority (400)
- *Status update:* admin succeeds, employee forbidden, unknown ticket (404), invalid status and malformed id (400)
- *RBAC:* employee sees only own tickets, admin sees all, employee blocked from other users' tickets

## 6. Gaps and risks

| ID | Gap | Why it matters | Planned test |
|---|---|---|---|
| G1 | Uncovered lines: `ticketController.js` L57, `auth.js` L47 | Unexercised code paths | Read the lines, add targeted cases |
| G2 | Branches: `errorHandler.js` L17, L31-32; `generateToken.js` L18 | Unexercised error and config branches | Unit cases for each branch |
| G3 | No missing-token (401) test on `GET /api/tickets`, `/stats`, `/:id`, `PUT /:id` | Auth enforcement only proven on POST and `/me` | One 401 test per route |
| G4 | Status transition rules unverified (e.g. closed to open) | Brief calls for transition tests | Confirm what the controller enforces, then test allowed and disallowed transitions |
| G5 | Models mocked, so schema validation, indexes and real queries are untested | Mocks can hide real Mongo behaviour | One integration suite on `mongodb-memory-server` |
| G6 | No coverage threshold enforced | Coverage can silently drop | Add `coverageThreshold` to `jest.config.js` |
| G7 | `routes/`, `models/`, `app.js`, `server.js` outside coverage scope | Reported 98% excludes them | Decide whether to widen `collectCoverageFrom` |
| G8 | Frontend has no tests | Out of scope for this sprint | Noted, not planned |

## 7. Plan for Days 3-4

**Day 3**
1. Close G1 and G2 with unit tests
2. Add G3 (401 per route) and G4 (status transitions)
3. Re-run `npm run test:coverage`

**Day 4**
1. Add the G5 in-memory MongoDB integration suite
2. Add G6 coverage thresholds (start at current levels, round down)
3. Capture the terminal coverage table and the HTML report (`backend/coverage/lcov-report/index.html`)
4. Open and merge the PR

## 8. Exit criteria

- All tests pass with `npm test`
- Coverage at or above thresholds, with no endpoint lacking a 401/403 check
- Coverage report and test output saved as sprint evidence
- Work merged through PRs only (branch protection on `main`)



## 9. Day 3 results

- **Tests:** 68 across 7 suites (17 added) in `tests/unit/edge-cases.test.js` and `tests/integration/tickets.gaps.test.js`.
- **Coverage:** 100% statements, branches, functions and lines (baseline was 98.58 / 90.66 / 100 / 98.52).
- **G1, G2, G3 closed** by the new tests.
- **G4 corrected:** `updateTicketStatus` enforces no transition rules. Any of `Open`, `In Progress`, `Resolved` is accepted from any current state, and `Closed` is rejected by the validator (400). Tests now document this behaviour. Whether Resolved to Open should be blocked is a product decision, not a test gap.
- **G5 note:** the `search` filter relies on a MongoDB `$text` index, which mocked models cannot verify. This is covered on Day 4 with an in-memory database.



## 10. Day 4 results

- **G5 closed:** `tests/integration/tickets.db.test.js` (16 tests) runs the ticket endpoints against a real in-memory MongoDB (`mongodb-memory-server`) with nothing mocked. It verifies schema defaults and validation, the `$text` search index, role-scoped queries, status and priority filters, stats counts, and persisted updates.
- **G6 closed:** `coverageThreshold` added to `jest.config.js` (statements 95, branches 90, functions 95, lines 95). The run fails if coverage drops below this floor.
- **Totals:** 84 tests across 8 suites, all passing, with 100% statement, branch, function and line coverage.
- **Out of scope:** G7 (widening coverage to routes and models) and G8 (frontend tests).