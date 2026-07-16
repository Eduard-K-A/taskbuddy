# TaskBuddy

A Philippine home-services marketplace: clients post jobs (Plumbing, Cleaning,
Handyman, Manicure, Pedicure), providers apply, and an ML recommendation engine
invites the best-matched providers when a job goes unfilled past its urgency timeout.

## Repository layout

**Live API:** https://taskbuddy-1d48.onrender.com ([status page](https://taskbuddy-1d48.onrender.com/) · [health JSON](https://taskbuddy-1d48.onrender.com/health)) — frontends should call this; see the [backend README](./backend/README.md#base-url).

| Folder | What it is |
|---|---|
| [`backend/`](./backend) | **NestJS REST API + Supabase schema** — the active focus. Start here: [`backend/README.md`](./backend/README.md) |
| [`ml-service/`](./ml-service) | Python FastAPI recommendation scorer (currently a stub; real Random Forest model in development) |
| [`mobile/`](./mobile) | Expo / React Native app |
| [`web/`](./web) | Next.js web app |

The authoritative data-schema and product spec is
[`backend/BACKEND_SCHEMA.md`](./backend/BACKEND_SCHEMA.md).
