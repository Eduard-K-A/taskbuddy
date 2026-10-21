# Handoff 005 — Slice 1: Xendit "Start a new payment" dead end

Date: 2026-10-21

## Status
- Slice 1 is complete. Slices 2, 3 and 4 are not started.
- Branch: `feat/oct21-feedback` (cut from `main` at `afb9ebd8`). Not pushed.
- Last code commit: `45f0109f`. The handoff commit follows it.
- Plan: `C:\Users\morad\.claude\plans\pasted-content-id-b146-1-step-nifty-dijkstra.md`
- Repo visibility: PUBLIC (checked with `gh repo view`). No secrets, `.env` values or memory files are in these commits.
- The deployed API (`/health` commit `8a5d9386`) contains the invoice-reuse code and `GET /payments/hire-status` answers 401, so the resume path is live.

## What changed
- `mobile/app/(homeowner)/screens/HOJobApplicationsScreen.tsx`:
  - `startNewPayment` now has the `hireInFlight` guard, sets `hireBusy`, and has try/catch, so a 429 or network error shows a message instead of doing nothing.
  - On `confirming` with `returnedPaid === false`, it ends the wait and shows "Your earlier checkout is still open…" so the pay options come back. Paying again reopens the same invoice (the server returns its URL).
  - `not_found` also ends the wait. A browser-reported paid return, or `needs_review`, keeps the wait with a "do not pay again" message.
  - `openHire` keeps the earlier `returnedPaid` flag instead of resetting it to false whenever the sheet reopens on `confirming`.
  - New `openCheckout` helper: a 409 (not a verification or capacity refusal) triggers one `hire-status` call; if the payment is `not_paid` the checkout is retried once. This works around the API's stray 409 right after an invoice expires (BH-1 item 2).
- `mobile/app/(homeowner)/screens/__tests__/HOJobApplicationsScreen.test.tsx`: 10 new tests (abandoned checkout, paid return, reopen, needs review, not found, failed check, and four for the 409 retry).

## Verification
Run from `mobile/`:
- `npm run typecheck`: 0 errors.
- `npm test` (final run): `Test Suites: 202 passed, 202 total`, `Tests: 3177 passed, 3177 total`.
- Baseline before the change: 201/202 suites. `HOHomeScreen.test.tsx` failed once under load (the known flake) and passed alone, 41/41.

## Decisions made
- Plan used `npx jest --runTestsByPath` for paths with parentheses, because jest reads a plain path argument as a regex.
- During the red step, two older tests ("while one payment waits…") failed only because failing new tests left queued `mockResolvedValueOnce` values; they passed once the implementation was in.
- No Co-Authored-By trailer (user's CLAUDE.md overrides the session reminder).

## Next
Slice 2: tap-to-view on the verification review photos (#1) and removing the Details/Appeal choice on open complaints (#5). First task: Task 2.1, the new `PhotoCard` tests in `mobile/src/components/verify/__tests__/PhotoCard.test.tsx`.

## Open items / backend
- BH-1 (Xendit hire checkout), to be written up in `docs/backend-handoff-oct21-feedback-2026-10-21.md` in Slice 4:
  - `hirePaymentStatus` builds `payment_status` from the pre-reconcile `attempt.status` (`hire-funding.service.ts` ~499), so the call that finds an expiry still says `confirming`.
  - `createCheckout` falls through to a 409 right after a reconcile marks the invoice `expired` (~208).
  - Optional: an endpoint to expire an open invoice, or a shorter `invoice_duration` than 30 minutes.
- Nothing is pushed yet. Slice 4 asks before pushing.
