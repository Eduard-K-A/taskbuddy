# TaskBuddy Admin Console

The admin dashboard for the TaskBuddy platform (`apps/web` in the monorepo). Next.js 16 App Router, TypeScript, Tailwind CSS v4, Lucide React, and Recharts. Runs entirely on mock data today, with a built-in data seam so switching to the real backend is a per-function swap — no page or component changes.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + CSS variables (dark & light themes)
- **Icons**: Lucide React
- **Charts**: Recharts
- **Runtime**: React 19
- **Tests**: Vitest (adapter unit tests) 
- **Shared contracts**: `@taskbuddy/shared-types` (workspace package)

## Features

- 🔐 Login / Auth Screen (mock credentials: `admin@taskbuddy.io` / `Admin123!`)
- 📊 Dashboard Overview — live stats, revenue chart, category breakdown, activity feed
- 🛡️ Provider Verification Queue — approve/reject with live state
- 👥 User Management — searchable table with role/status badges
- 💳 Transaction Monitoring — full log with status colors
- 📅 Booking Tracker — search and filter
- 📈 Reports & Analytics — area chart, pie chart, bar chart, top providers
- ⚙️ Settings — account, notifications, platform, appearance
- 🌙 Dark & light themes (persisted), collapsible sidebar, SPA navigation

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build
npm start       # serve the production build
npm run lint    # eslint
npm test        # vitest unit tests
```

## Project Structure

```
src/
├── app/
│   ├── globals.css              # Theme CSS variables (dark defaults, light overrides), badges, table styles
│   ├── layout.tsx               # Root layout + metadata
│   └── page.tsx                 # Entry point (AppProvider + AppShell)
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx         # Login gate + sidebar/header/page routing
│   │   ├── Sidebar.tsx          # Collapsible navigation sidebar
│   │   └── Header.tsx           # Top bar + notifications dropdown
│   └── pages/                   # One component per admin page (7 pages + login)
├── context/
│   └── AppContext.tsx           # App state: session, data, mutations, persisted preferences
└── lib/
    ├── domain.ts                # Backend-shaped domain types (extends @taskbuddy/shared-types)
    ├── mock/db.ts               # In-memory mock database
    ├── services/                # THE DATA SEAM — pages/context only ever call these
    ├── adapters/                # Domain → display-row mapping, formatting (+ unit tests)
    └── api/client.ts            # Fetch client for the real backend (unused while mocked)
```

## Data Flow (the seam)

```
pages/context → services (async fns) → mock/db.ts   (today)
                                     → api/client.ts (later)
```

- **Pages and `AppContext` never touch data sources directly** — they call `lib/services` functions and render the display rows produced by `lib/adapters`.
- Every service function contains a `// later: client.get/post/patch(...)` comment showing its real-backend implementation.
- Services simulate ~150ms latency so loading states are genuinely exercised.

## Connecting the Real Backend

When `apps/backend` ships its admin endpoints:

1. Set the environment variables:
   ```bash
   NEXT_PUBLIC_USE_MOCK=false
   NEXT_PUBLIC_API_URL=http://localhost:3001   # or the deployed API URL
   ```
2. In `src/lib/services/index.ts`, replace each function body with the one-line `client` call already noted in its `// later:` comment.
3. Nothing else changes — domain types, adapters, context, and every page keep working as-is.

Domain types in `lib/domain.ts` reuse the platform-wide contracts from `@taskbuddy/shared-types`; admin-only types live there until the backend defines authoritative versions.

## npm audit note

After `npm install` you may see **2 moderate** warnings about `postcss`. These are a **known npm false positive** — npm is flagging a copy of PostCSS that is *bundled inside* Next.js 16 itself (in `node_modules/next/node_modules/postcss`). Next.js controls that copy and never passes user-provided HTML through it, so it does not affect your app. The only "fix" npm offers would downgrade you to Next.js 9, which is obviously wrong. You can safely ignore these warnings.
