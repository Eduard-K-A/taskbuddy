# TaskBuddy Backend

REST API for **TaskBuddy**, a Philippine home-services marketplace: **clients**
post jobs in five categories (Plumbing, Cleaning, Handyman, Manicure, Pedicure)
and **providers** apply to them. If nobody is hired before the job's urgency
timeout, an ML **recommendation engine** scores eligible providers and invites
the best matches.

The full data-schema and product spec lives in [`BACKEND_SCHEMA.md`](./BACKEND_SCHEMA.md)
— that document is the source of truth for tables, lifecycle rules, and ML features.

> **🚀 Deployed instance:** the backend is live at
> **https://taskbuddy-1d48.onrender.com** — frontend developers can build
> against it directly, no local backend setup required (see
> [Base URL](#base-url) below). Status page: <https://taskbuddy-1d48.onrender.com/> ·
> JSON health: <https://taskbuddy-1d48.onrender.com/health>

## Architecture

```
mobile / web ──REST──► backend/ (NestJS, :3000)
                          │  verifies Supabase JWTs
                          │  reads/writes Postgres via service-role key
                          │  cron (every minute): urgency-timeout poller
                          ▼
                     Supabase (Postgres + Auth + RLS)
                          ▲
                          │  POST /score (14 features per pair → probabilities)
                     ml-service/ (FastAPI — Random Forest rf-a-v1)
```

- **Supabase** provides Postgres (schema, triggers, RLS) and Auth (signup/login → JWTs).
- **NestJS** is the only thing the frontends talk to (besides token refresh, which
  also goes through it). It enforces authorization in code and owns all DB writes.
- **ml-service** is a stateless scorer serving the trained **Random Forest
  `rf-a-v1`** (0.82 accuracy / 0.88 ROC-AUC holdout). Deployed at
  <https://taskbuddy-ml-service.onrender.com> — see
  [`../ml-service/README.md`](../ml-service/README.md).

### The matching flow

1. Client posts a job (`urgency`: urgent / normal / flexible).
2. Providers browse and apply organically; the client accepts **exactly one**.
3. If nobody is accepted before the urgency timeout (**5 / 10 / 15 min**), the
   scheduler moves the job to `recommending`, computes 14 ML features per eligible
   provider (SQL function `fn_job_provider_features`), scores them via ml-service,
   stores the ranked results, and notifies the **top 8** providers.
4. Recommended providers apply like anyone else; the client still picks one.
5. Job proceeds `assigned → in_progress → completed`, then the client leaves a
   review. Every scored candidate is labeled (`was_hired`) for future retraining.

Job lifecycle: `open → recommending → assigned → in_progress → completed`
(plus `cancelled` from any pre-completion state, and `expired` after 24 h unassigned).

## Setup

> Building a frontend? You can skip this whole section and use the
> [deployed instance](#base-url). Local setup is only needed when working on
> the backend itself.

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. Apply the migrations in [`supabase/migrations/`](./supabase/migrations) **in order**
   (0001 → 0004), either by pasting each file into the SQL Editor or with the CLI:

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```

   | File | Contents |
   |---|---|
   | `0001_enums_and_tables.sql` | enums, all 11 tables, indexes |
   | `0002_functions_and_triggers.sql` | signup trigger, lifecycle triggers, cached-stat triggers, `haversine_km`, `fn_job_provider_features` |
   | `0003_rls.sql` | Row Level Security policies |
   | `0004_seed.sql` | 5 categories + urgency timeouts |
   | `0005_admin_role.sql` | adds `'admin'` to `user_role` enum + `admin_user_overview` view (profiles ⋈ `auth.users` email, service-role only) for the Admin Dashboard (#29/#31/#32). Admins can't self-register — promote a user manually after this migration (see the comment at the end of the file). |

3. (Development) In Authentication → Providers → Email, consider disabling
   "Confirm email" so `POST /auth/register` returns a session immediately.

### 2. API

```bash
cd backend
cp .env.example .env    # fill in your Supabase URL + keys (Settings → API)
npm install
npm run start:dev       # http://localhost:3000
```

### 3. ML service

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\activate        # Windows (source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
uvicorn app.main:app --port 8000
```

The committed model artifact (`ml-service/model/rf-a-v1.joblib`) is served as-is
— no training step needed. The API works without the service running, but
recommendation runs will fail until it's up (jobs still reach `recommending`;
use the manual trigger endpoint to retry). Full details:
[`../ml-service/README.md`](../ml-service/README.md).

## For frontend developers

### Base URL

| Environment | Base URL |
|---|---|
| **Production (Render)** | `https://taskbuddy-1d48.onrender.com` |
| Local development | `http://localhost:3000` |

Don't hardcode the URL — read it from an environment variable so it can be
switched per environment:

- **web (Next.js):** put `NEXT_PUBLIC_API_URL=https://taskbuddy-1d48.onrender.com`
  in `web/.env.local` and use `process.env.NEXT_PUBLIC_API_URL`.
- **mobile (Expo):** put `EXPO_PUBLIC_API_URL=https://taskbuddy-1d48.onrender.com`
  in `mobile/.env` and use `process.env.EXPO_PUBLIC_API_URL`.

> **Free-tier note:** the Render instance spins down after ~15 minutes without
> traffic; the first request after that takes 30–60 s to answer (cold start).
> If a request seems to hang, wait — it's waking up, not broken. Check
> <https://taskbuddy-1d48.onrender.com/health> if unsure.

### Authentication

1. `POST /auth/register` with `{ email, password, role, full_name }` — `role` is
   `"client"` or `"provider"` and **cannot change later**. A DB trigger creates the
   profile automatically.
2. `POST /auth/login` returns `{ session: { access_token, refresh_token, expires_at } }`.
3. Send `Authorization: Bearer <access_token>` on every other request.
4. When the token expires, `POST /auth/refresh` with `{ refresh_token }`.

Providers must additionally set up their provider profile
(`PUT /profiles/me/provider`) before they can apply to jobs.

### Endpoint reference

All bodies are JSON. 🔒 = requires auth; (client) / (provider) = role-restricted.

**Auth**

| Method & path | Description |
|---|---|
| `POST /auth/register` | `{ email, password, role, full_name, phone? }` |
| `POST /auth/login` | `{ email, password }` → session tokens |
| `POST /auth/refresh` | `{ refresh_token }` → new session |
| `POST /auth/logout` 🔒 | revoke the session |
| `GET /auth/me` 🔒 | `{ profile, provider_profile }` |

**Profiles & providers**

| Method & path | Description |
|---|---|
| `PATCH /profiles/me` 🔒 | update `full_name, phone, avatar_url, address, city, latitude, longitude` |
| `PUT /profiles/me/provider` 🔒 (provider) | `{ category_id, bio (20–400 chars), years_experience?, service_radius_km? }` |
| `PATCH /profiles/me/provider/availability` 🔒 (provider) | `{ is_available: boolean }` |
| `GET /providers/:id` 🔒 | public provider card (bio, category, rating, completed jobs) |
| `GET /providers/:id/reviews` 🔒 | reviews for a provider |
| `GET /categories` 🔒 | `[{ id, name }]` |

**Jobs**

| Method & path | Description |
|---|---|
| `POST /jobs` 🔒 (client) | `{ category_id, title (5–120), description (20–750), urgency?, address, latitude, longitude }` |
| `GET /jobs?category_id=&limit=&offset=` 🔒 (provider) | browse `open`/`recommending` jobs |
| `GET /jobs/mine` 🔒 (client) | own jobs |
| `GET /jobs/assigned` 🔒 (provider) | jobs assigned to me |
| `GET /jobs/:id` 🔒 | job detail |
| `POST /jobs/:id/cancel` 🔒 (client) | any pre-completion state → `cancelled` |
| `POST /jobs/:id/start` 🔒 (provider) | `assigned` → `in_progress` |
| `POST /jobs/:id/complete` 🔒 (client) | `in_progress` → `completed` |
| `POST /jobs/:id/recommendations/trigger` 🔒 (client) | manually re-run the recommendation engine |

**Applications**

| Method & path | Description |
|---|---|
| `POST /jobs/:jobId/applications` 🔒 (provider) | `{ cover_message? (≤300) }` — one per job |
| `GET /jobs/:jobId/applications` 🔒 (client) | applicants for own job |
| `GET /applications/mine` 🔒 (provider) | my applications with job info |
| `POST /applications/:id/accept` 🔒 (client) | hire this provider — assigns the job, auto-rejects everyone else |
| `POST /applications/:id/reject` 🔒 (client) | decline |
| `POST /applications/:id/withdraw` 🔒 (provider) | retract a pending application |

**Reviews & notifications**

| Method & path | Description |
|---|---|
| `POST /jobs/:jobId/review` 🔒 (client) | `{ rating: 1–5, comment? (≤500) }` — once per completed job |
| `GET /notifications?unread=true` 🔒 | newest 50 |
| `POST /notifications/:id/read` 🔒 | mark one read |
| `POST /notifications/read-all` 🔒 | mark all read |

**Admin** (🔒 admin role only — 401 without a token, 403 for non-admins)

| Method & path | Description |
|---|---|
| `GET /admin/users?search=&role=&status=&limit=&offset=` | search/filter users (`role`: client/provider/admin, `status`: active/suspended) |
| `GET /admin/users/:id` | single user detail (from `admin_user_overview`) |
| `POST /admin/users/:id/suspend` | deactivate an account (blocks their login) — refuses if already suspended or if the target is an admin |
| `POST /admin/users/:id/reinstate` | reactivate a suspended account |
| `GET /admin/bookings?status=&category_id=&limit=&offset=` | platform-wide bookings view (story #31) |
| `POST /admin/bookings/:id/cancel` | force-cancel a booking — refuses if already `completed`/`cancelled`/`expired` |
| `GET /admin/analytics/summary` | totals (users/clients/providers/suspended/bookings), bookings by status/category, daily booking trend, top 10 providers by completed jobs (story #32) |

Admin accounts can't self-register (`POST /auth/register` only allows
`client`/`provider`) and log in through the same `POST /auth/login` as
everyone else — there's no separate admin login endpoint. See
`0005_admin_role.sql` above for how to promote an account to `admin`.

**Not yet implemented on the admin side:** a change-password endpoint (the
admin web console still mocks this), and anything for Verifications or
Transactions — those have no backing tables yet.

### Errors

Errors use NestJS's standard shape with proper status codes (400 validation,
401 bad/expired token, 403 wrong role/not owner, 404 not found):

```json
{ "statusCode": 400, "message": ["title must be longer than or equal to 5 characters"], "error": "Bad Request" }
```

### Example flow (curl)

```bash
API=https://taskbuddy-1d48.onrender.com   # or http://localhost:3000

# 1. Register + login as client
curl -X POST $API/auth/register -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"secret123","role":"client","full_name":"Ana Cruz"}'
TOKEN=$(curl -sX POST $API/auth/login -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"secret123"}' | jq -r .session.access_token)

# 2. Post a job
curl -X POST $API/jobs -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"category_id":1,"title":"Fix kitchen faucet","description":"Tumutulo yung gripo sa kusina, need ayusin agad po.","urgency":"urgent","address":"Quezon City","latitude":14.6760,"longitude":121.0437}'
```

## Recommendation engine

- A scheduler inside the API runs **every minute**: `open` jobs past their
  `recommendation_deadline` flip to `recommending` (at most once), get scored, and
  the top 8 providers receive `recommendation_invite` notifications.
- Feature vectors come from the `fn_job_provider_features(job_id)` SQL function —
  14 raw features per pair, names matching the ML training CSV exactly.
- Scoring is done by the trained **Random Forest `rf-a-v1`** in ml-service
  (`recommendation_runs.model_version` records which model produced each run).
- Every scored pair is snapshotted in `recommendation_candidates`; when the job
  closes, `was_hired` is backfilled, turning production data into retraining rows.
  Export query: see `BACKEND_SCHEMA.md` §13 — **exclude `model_version = 'stub-v0'`
  rows** (produced by the early placeholder scorer). Retraining/versioning guide:
  [`../ml-service/README.md`](../ml-service/README.md).

## Project layout

```
backend/
├── BACKEND_SCHEMA.md            # authoritative data & ML spec
├── supabase/migrations/         # SQL: schema, triggers, RLS, seed
└── src/
    ├── supabase/                # service-role + anon Supabase clients
    ├── auth/                    # register/login/refresh, JWT guard, @Roles
    ├── profiles/                # own profile + provider profile
    ├── categories/  providers/  # lookups & public provider cards
    ├── jobs/                    # posting, browsing, lifecycle transitions
    ├── applications/            # apply / accept / reject / withdraw
    ├── reviews/  notifications/
    └── recommendations/         # scoring service + every-minute scheduler
```

## Scripts

```bash
npm run start:dev   # dev server with watch
npm run build       # compile
npm run lint        # eslint --fix
npm run format      # prettier
```
