# Backend handoff: Oct 21 UAT feedback (2026-10-21)

Mobile work for all three items is done on branch `feat/oct21-feedback`. Each item lists what the app already does and what it needs from the API.

## BH-1 — Xendit hire checkout: confirming after an abandoned invoice

**What the client saw.** They opened Hire and pay, closed Xendit without paying, and came back to "still confirming". "Start a new payment" did nothing.

**Mobile fix (done).** If the browser never reported a payment and `GET /payments/hire-status` says `confirming`, the app ends its wait. Paying again calls `POST /payments/hire-checkout-session`, which already returns the same pending invoice URL (`hire-funding.service.ts:201-206`). So nothing can be charged twice.

**Backend bugs that still make the client wait or see an error:**

1. **Stale status in `hirePaymentStatus`** (`backend/src/payments/hire-funding.service.ts` ~448-505). `attempt` is read, then `reconcileHireInvoice` runs, but `payment_status` is built from the old `attempt.status` (~line 499). The call that discovers an expiry still answers `confirming`. Re-read the attempt after reconciling, or use the status the reconcile returns.
2. **409 right after an expiry in `createCheckout`** (~173-211). When the reconcile at ~191 marks the attempt `expired`, `latestAttempt` is neither `processed` nor `pending`, so the code falls through to the 409 "A payment for this proposal is already being confirmed…". Fix: when `latestAttempt?.status` is `expired` or `failed`, continue to create a new invoice instead of throwing. (Mobile works around this today: after that 409 it asks `hire-status` once and, if the payment is `not_paid`, retries the checkout once. That retry costs the client one extra `hire-status` call, which is limited to 5 per minute. Once this is fixed the retry never fires.)
3. **Optional: let the client cancel an open invoice.** Add `POST /payments/hire-checkout-session/expire` with body `{ application_id }`. Client role, proposal ownership check. It calls Xendit `POST /invoices/{id}/expire!` for the latest `pending` attempt and marks it `expired`. With it, "Start a new payment" can start truly fresh rather than reopening. A shorter `invoice_duration` than `30 * 60` (`xendit.service.ts:176`) is another option. Mobile does not call this yet; tell us if you add it.

**Test spec (write first, see them fail):**
- `hirePaymentStatus` returns `not_paid` on the same call whose reconcile marks the invoice `EXPIRED`.
- `createCheckout` for a proposal whose only attempt reconciles to `EXPIRED` returns a **new** invoice URL, not 409.
- `createCheckout` for a still-`PENDING` attempt keeps returning the same URL and invoice id (the existing test at `hire-funding.service.spec.ts` ~648 stays green).
- (If 3 is built) expire: 403 for another client's proposal; 409 when the attempt is `processing`/`needs_review`; Xendit is not called twice for an already-expired attempt.

## BH-2 — `GET /conversations`: last message for the list preview

**Ask.** Add three flat fields to each row returned by `ChatService.listConversations` / `shape()` (`backend/src/chat/chat.service.ts` ~57-84, ~487-500):

| field | type | value |
|---|---|---|
| `last_message_body` | `string \| null` | newest message's `body` (may be `''` for a photo) |
| `last_message_has_attachment` | `boolean` | `attachment_path is not null` on that message |
| `last_message_sender_id` | `string \| null` | its `sender_id`; `null` when the chat has no messages |

Get the newest message per conversation with one query, not N. For example, an RPC using `distinct on (conversation_id) … order by conversation_id, created_at desc`, or a lateral join, over the caller's conversation ids. Do **not** mark anything read.

**Mobile (done).** The app shows "Sent a photo" (the same wording as the chat push), "You: …" for the caller's own message, and leaves the line out while these fields are absent. Field names must match exactly.

**Test spec:** one row per conversation carrying the newest message's three fields. `last_message_sender_id: null` and `last_message_has_attachment: false` for a chat with no messages. A photo-only message gives `last_message_body: ''` and `last_message_has_attachment: true`. Unread counts are unchanged by the call.

## BH-3 — Store the provider's decline reason on the job

**Today.** `POST /jobs/:id/decline` (`jobs.service.ts` ~484-504) validates `reason` (1-200 chars, `DeclineJobDto`) but only writes it into the notification body. The client's job screen can't show it reliably.

**Ask.**
1. New migration `0078_job_cancellation_reason.sql`: `alter table public.jobs add column cancellation_reason text check (cancellation_reason is null or char_length(cancellation_reason) <= 200);`. Update `BACKEND_SCHEMA.md` and the README migration table.
2. In `decline`, pass `{ cancelled_by: user.id, cancellation_reason: dto.reason }` to `setStatus`.
3. It comes back on `GET /jobs/:id` through `*`; no select change.

**Mobile (done).** The client's job card shows "<Provider> declined this booking" (from `cancelled_by`, already returned) and "Reason: …". It prefers `job.cancellation_reason`; until that exists it reads the "Booking declined" notification, which only works within the 50 newest notifications.

**Test spec:** decline stores `cancellation_reason` equal to the DTO reason. `GET /jobs/:id` returns it. A client cancel leaves it `null`. The DTO limit (200) and the column check agree.

## No backend work

- Tap-to-view on the verification review photos.
- Removing the Details/Appeal choice on open complaints (open cases send `kind: 'statement'`, closed cases `kind: 'appeal'`; the API contract is unchanged).
- The profession pill on chat rows (mapped on the device from the job's service).
